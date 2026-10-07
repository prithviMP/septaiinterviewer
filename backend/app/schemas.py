from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.services.mock_content import ALLOWED_TOPICS


class SessionCreate(BaseModel):
    topics: list[str] = Field(min_length=1)
    level: Literal["junior", "mid", "senior"] = "mid"
    question_count: Literal[3, 5, 8] = 5
    focuses: list[str] = Field(default_factory=list)

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

    @field_validator("focuses")
    @classmethod
    def clean_focuses(cls, focuses: list[str]) -> list[str]:
        return [item.strip() for item in focuses if item.strip()]


class SessionRead(BaseModel):
    id: str
    topics: list[str]
    status: str
    created_at: datetime


class ExampleRead(BaseModel):
    title: str
    input: str
    output: str
    explanation: str = ""


class StartersRead(BaseModel):
    python: str = ""
    javascript: str = ""
    java: str = ""


class QuestionRead(BaseModel):
    id: str
    topic: str
    difficulty: str
    title: str
    question_text: str
    constraints: list[str]
    examples: list[ExampleRead]
    starters: StartersRead


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
    badge: str = "Good"


class QuestionEvaluation(BaseModel):
    question_id: str
    topic: str
    question_text: str
    user_response: str | None
    score: float
    badge: str
    feedback: Feedback


class PillarRead(BaseModel):
    name: str
    score: float
    detail: str


class DrillRead(BaseModel):
    title: str
    detail: str
    chips: list[str] = Field(default_factory=list)


class EvaluationRead(BaseModel):
    session_id: str
    overall_score: float
    summary: str
    pillars: list[PillarRead]
    drills: list[DrillRead]
    question_evaluations: list[QuestionEvaluation]


class HintRead(BaseModel):
    hint: str
