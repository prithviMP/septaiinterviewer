from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InterviewSession(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    topics: Mapped[list] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="in_progress")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    questions: Mapped[list["Question"]] = relationship(back_populates="session")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), nullable=False, index=True)
    position: Mapped[int] = mapped_column(nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    user_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    feedback: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    session: Mapped[InterviewSession] = relationship(back_populates="questions")
