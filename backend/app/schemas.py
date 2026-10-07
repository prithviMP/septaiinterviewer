from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.services.mock_content import ALLOWED_TOPICS


class SessionCreate(BaseModel):
    topics: list[str] = Field(min_length=1)

    @field_validator("topics")
    @classmethod
    def known_topics(cls, topics: list[str]) -> list[str]:
        unique: list[str] = []
        for topic in topics:
            if topic not in ALLOWED_TOPICS:
                allowed = ", ".join(ALLOWED_TOPICS)
                raise ValueError(f"Unknown topic '{topic}'. Choose from: {allowed}")
            if topic not in unique:
                unique.append(topic)
        return unique


class SessionRead(BaseModel):
    id: str
    topics: list[str]
    status: str
    created_at: datetime


class QuestionRead(BaseModel):
    id: str
    topic: str
    question_text: str


class QuestionList(BaseModel):
    session_id: str
    questions: list[QuestionRead]


class AnswerIn(BaseModel):
    question_id: str
    response: str


class SubmitIn(BaseModel):
    answers: list[AnswerIn] = Field(min_length=1)


class SubmitResult(BaseModel):
    session_id: str
    status: str


class Feedback(BaseModel):
    key_strengths: list[str]
    areas_for_improvement: list[str]
    ideal_answer_summary: str


class QuestionEvaluation(BaseModel):
    question_id: str
    topic: str
    question_text: str
    user_response: str | None
    score: float
    feedback: Feedback


class EvaluationRead(BaseModel):
    session_id: str
    overall_score: float
    question_evaluations: list[QuestionEvaluation]
