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
    QuestionEvaluation,
    QuestionList,
    QuestionRead,
    SessionCreate,
    SessionRead,
    SubmitIn,
    SubmitResult,
)
from app.services.mock_content import mock_feedback, mock_score, questions_for_topics

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_session(db: Session, session_id: str) -> InterviewSession:
    interview = db.get(InterviewSession, session_id)
    if interview is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return interview


@router.post("/sessions", response_model=SessionRead, status_code=201)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)) -> InterviewSession:
    now = _utcnow()
    interview = InterviewSession(
        id=str(uuid.uuid4()),
        topics=payload.topics,
        status="in_progress",
        created_at=now,
        updated_at=now,
    )
    db.add(interview)
    for row in questions_for_topics(payload.topics):
        db.add(
            Question(
                id=str(uuid.uuid4()),
                session_id=interview.id,
                position=row["position"],
                topic=row["topic"],
                question_text=row["question_text"],
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
        questions=[
            QuestionRead(id=question.id, topic=question.topic, question_text=question.question_text)
            for question in questions
        ],
    )


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

    for answer in payload.answers:
        question = by_id[answer.question_id]
        score = mock_score(answer.response)
        question.user_response = answer.response
        question.score = score
        question.feedback = mock_feedback(question.topic, answer.response, score)

    interview.status = "completed"
    interview.updated_at = _utcnow()
    db.commit()
    return SubmitResult(session_id=interview.id, status=interview.status)


@router.get("/sessions/{session_id}/evaluation", response_model=EvaluationRead)
def get_evaluation(session_id: str, db: Session = Depends(get_db)) -> EvaluationRead:
    interview = _get_session(db, session_id)
    if interview.status != "completed":
        raise HTTPException(status_code=404, detail="Evaluation is available after the interview is submitted")

    questions = db.scalars(
        select(Question).where(Question.session_id == interview.id).order_by(Question.position)
    ).all()
    scores = [question.score or 0.0 for question in questions]
    overall = round(sum(scores) / len(scores), 1) if scores else 0.0

    return EvaluationRead(
        session_id=interview.id,
        overall_score=overall,
        question_evaluations=[
            QuestionEvaluation(
                question_id=question.id,
                topic=question.topic,
                question_text=question.question_text,
                user_response=question.user_response,
                score=question.score or 0.0,
                feedback=Feedback.model_validate(question.feedback or {}),
            )
            for question in questions
        ],
    )
