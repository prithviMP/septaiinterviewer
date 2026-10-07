import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession, Question
from app.schemas import (
    EvaluationRead,
    Feedback,
    HintRead,
    PillarRead,
    QuestionEvaluation,
    QuestionList,
    QuestionRead,
    SessionCreate,
    SessionRead,
    StartersRead,
    SubmitIn,
    SubmitResult,
    DrillRead,
)
from app.services.gemini import (
    GeminiError,
    GeminiNotConfigured,
    evaluate_answers,
    generate_questions,
    request_hint,
    require_gemini,
)

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_session(db: Session, session_id: str) -> InterviewSession:
    interview = db.get(InterviewSession, session_id)
    if interview is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return interview


def _guard() -> None:
    try:
        require_gemini()
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def _run(action):
    try:
        return action()
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


def _question_read(question: Question) -> QuestionRead:
    detail = question.detail or {}
    starters = detail.get("starters") or {}
    return QuestionRead(
        id=question.id,
        topic=question.topic,
        difficulty=question.difficulty,
        title=detail.get("title") or question.topic,
        question_text=question.question_text,
        constraints=list(detail.get("constraints") or []),
        examples=list(detail.get("examples") or []),
        starters=StartersRead(
            python=starters.get("python") or "",
            javascript=starters.get("javascript") or "",
            java=starters.get("java") or "",
        ),
    )


@router.post("/sessions", response_model=SessionRead, status_code=201)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)) -> InterviewSession:
    _guard()
    rows = _run(
        lambda: generate_questions(
            payload.topics,
            payload.level,
            payload.question_count,
            payload.focuses,
        )
    )
    now = _utcnow()
    interview = InterviewSession(
        id=str(uuid.uuid4()),
        topics=payload.topics,
        level=payload.level,
        question_count=payload.question_count,
        focuses=payload.focuses,
        status="in_progress",
        created_at=now,
        updated_at=now,
    )
    db.add(interview)
    for position, row in enumerate(rows):
        db.add(
            Question(
                id=str(uuid.uuid4()),
                session_id=interview.id,
                position=position,
                topic=row["topic"],
                difficulty=row["difficulty"],
                question_text=row["question_text"],
                detail={
                    "title": row["title"],
                    "constraints": row["constraints"],
                    "examples": row["examples"],
                    "starters": row["starters"],
                },
            )
        )
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/sessions/{session_id}/questions", response_model=QuestionList)
def list_questions(session_id: str, db: Session = Depends(get_db)) -> QuestionList:
    interview = _get_session(db, session_id)
    questions = db.scalars(
        select(Question).where(Question.session_id == interview.id).order_by(Question.position)
    ).all()
    return QuestionList(
        session_id=interview.id,
        questions=[_question_read(question) for question in questions],
    )


@router.post("/sessions/{session_id}/questions/{question_id}/hint", response_model=HintRead)
def hint_question(session_id: str, question_id: str, db: Session = Depends(get_db)) -> HintRead:
    _guard()
    interview = _get_session(db, session_id)
    question = db.get(Question, question_id)
    if question is None or question.session_id != interview.id:
        raise HTTPException(status_code=404, detail="Question not found")
    detail = question.detail or {}
    hint = _run(
        lambda: request_hint(
            question.topic,
            detail.get("title") or question.topic,
            question.question_text,
        )
    )
    return HintRead(hint=hint)


@router.post("/sessions/{session_id}/submit", response_model=SubmitResult)
def submit_session(session_id: str, payload: SubmitIn, db: Session = Depends(get_db)) -> SubmitResult:
    interview = _get_session(db, session_id)
    if interview.status == "completed":
        raise HTTPException(status_code=409, detail="Session has already been submitted")

    questions = db.scalars(
        select(Question).where(Question.session_id == interview.id).order_by(Question.position)
    ).all()
    by_id = {question.id: question for question in questions}
    seen: set[str] = set()

    for answer in payload.answers:
        if answer.question_id in seen:
            raise HTTPException(status_code=422, detail=f"Duplicate answer for {answer.question_id}")
        seen.add(answer.question_id)
        if answer.question_id not in by_id:
            raise HTTPException(status_code=422, detail=f"Unknown question {answer.question_id}")

    missing = [question.id for question in questions if question.id not in seen]
    if missing:
        raise HTTPException(status_code=422, detail="Submit an answer for every question")

    _guard()
    evaluation = _run(
        lambda: evaluate_answers(
            [
                {
                    "question_id": answer.question_id,
                    "topic": by_id[answer.question_id].topic,
                    "prompt": by_id[answer.question_id].question_text,
                    "response": answer.response,
                }
                for answer in payload.answers
            ]
        )
    )
    scored = {item["question_id"]: item for item in evaluation["question_evaluations"]}

    for answer in payload.answers:
        question = by_id[answer.question_id]
        item = scored[answer.question_id]
        question.user_response = answer.response
        question.score = item["score"]
        question.feedback = {
            "key_strengths": item["key_strengths"],
            "areas_for_improvement": item["areas_for_improvement"],
            "ideal_answer_summary": item["ideal_answer_summary"],
            "badge": item["badge"],
        }

    interview.status = "completed"
    interview.overall_score = evaluation["overall_score"]
    interview.summary = evaluation["summary"]
    interview.pillars = evaluation["pillars"]
    interview.drills = evaluation["drills"]
    interview.updated_at = _utcnow()
    db.commit()
    return SubmitResult(session_id=interview.id, status=interview.status)


@router.get("/sessions/{session_id}/evaluation", response_model=EvaluationRead)
def get_evaluation(session_id: str, db: Session = Depends(get_db)) -> EvaluationRead:
    interview = _get_session(db, session_id)
    if interview.status != "completed" or interview.overall_score is None:
        raise HTTPException(status_code=404, detail="Evaluation is available after the interview is submitted")

    questions = db.scalars(
        select(Question).where(Question.session_id == interview.id).order_by(Question.position)
    ).all()

    return EvaluationRead(
        session_id=interview.id,
        overall_score=interview.overall_score,
        summary=interview.summary or "",
        pillars=[PillarRead.model_validate(item) for item in (interview.pillars or [])],
        drills=[DrillRead.model_validate(item) for item in (interview.drills or [])],
        question_evaluations=[
            QuestionEvaluation(
                question_id=question.id,
                topic=question.topic,
                question_text=question.question_text,
                user_response=question.user_response,
                score=question.score or 0.0,
                badge=(question.feedback or {}).get("badge") or "Good",
                feedback=Feedback.model_validate(question.feedback or {}),
            )
            for question in questions
        ],
    )
