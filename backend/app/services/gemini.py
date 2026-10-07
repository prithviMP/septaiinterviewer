"""Gemini calls for questions, hints, and scorecards.

The key stays in the environment. Tests replace these functions and never
reach Google.
"""

from pydantic import BaseModel, Field

import app.config as config

BADGES = ("Needs Work", "Good", "Excellent")


class GeminiNotConfigured(Exception):
    """Raised when GEMINI_API_KEY is missing."""


class GeminiError(Exception):
    """Raised when Gemini returns something the interview cannot store."""


class ExampleOut(BaseModel):
    title: str
    input: str
    output: str
    explanation: str = ""


class StartersOut(BaseModel):
    python: str = ""
    javascript: str = ""
    java: str = ""


class QuestionOut(BaseModel):
    topic: str
    difficulty: str
    title: str
    prompt: str
    constraints: list[str] = Field(default_factory=list)
    examples: list[ExampleOut] = Field(default_factory=list)
    starters: StartersOut = Field(default_factory=StartersOut)


class QuestionBatch(BaseModel):
    questions: list[QuestionOut]


class PillarOut(BaseModel):
    name: str
    score: float
    detail: str


class DrillOut(BaseModel):
    title: str
    detail: str
    chips: list[str] = Field(default_factory=list)


class ScoredQuestion(BaseModel):
    question_id: str
    score: float
    badge: str
    key_strengths: list[str] = Field(default_factory=list)
    areas_for_improvement: list[str] = Field(default_factory=list)
    ideal_answer_summary: str


class EvaluationOut(BaseModel):
    overall_score: float
    summary: str
    pillars: list[PillarOut] = Field(default_factory=list)
    drills: list[DrillOut] = Field(default_factory=list)
    question_evaluations: list[ScoredQuestion]


class HintOut(BaseModel):
    hint: str


def require_gemini() -> None:
    if not (config.settings.gemini_api_key or "").strip():
        raise GeminiNotConfigured("Set GEMINI_API_KEY in the backend environment.")


def generate_questions(
    topics: list[str],
    level: str,
    question_count: int,
    focuses: list[str],
) -> list[dict]:
    focus_line = ", ".join(focuses) if focuses else "accuracy, completeness, and clarity"
    prompt = (
        "Write a technical interview.\n"
        f"Topics: {', '.join(topics)}.\n"
        f"Level: {level}.\n"
        f"Question count: {question_count}. Return exactly that many questions.\n"
        f"Spread the questions across the selected topics.\n"
        f"Coach focus: {focus_line}.\n"
        "Each question needs a topic from the selected list, a difficulty "
        "(Easy, Medium, or Hard), a short title, a prompt, constraints, "
        "one or two examples with input, output, and explanation, and short "
        "starter code for Python, JavaScript, and Java. Starters are scaffolds, "
        "not solutions."
    )
    batch = _generate(prompt, QuestionBatch)
    if len(batch.questions) < question_count:
        raise GeminiError("Gemini returned fewer questions than requested. Try again.")

    rows: list[dict] = []
    for index, item in enumerate(batch.questions[:question_count]):
        topic = item.topic if item.topic in topics else topics[index % len(topics)]
        rows.append(
            {
                "topic": topic,
                "difficulty": item.difficulty or "Medium",
                "title": item.title,
                "question_text": item.prompt,
                "constraints": item.constraints,
                "examples": [example.model_dump() for example in item.examples],
                "starters": item.starters.model_dump(),
            }
        )
    return rows


def evaluate_answers(items: list[dict]) -> dict:
    packed = [
        {
            "question_id": item["question_id"],
            "topic": item["topic"],
            "prompt": item["prompt"],
            "answer": item["response"],
        }
        for item in items
    ]
    prompt = (
        "Score this technical interview.\n"
        "Score every answer from 0 to 10 on accuracy, completeness, and clarity.\n"
        "Return an overall score, a short coach summary, exactly three pillar "
        "scores named Accuracy, Completeness, and Clarity, and for each question "
        "the same question_id, a score, a badge (Needs Work, Good, or Excellent), "
        "strengths, improvements, and an ideal-answer summary.\n"
        "Add drills only when a gap is real. Each drill has a title, a detail, "
        "and short chips.\n"
        f"Answers:\n{packed}"
    )
    result = _generate(prompt, EvaluationOut)
    expected_ids = [item["question_id"] for item in items]
    scored = list(result.question_evaluations)
    if len(scored) != len(expected_ids) or {row.question_id for row in scored} != set(expected_ids):
        if len(scored) == len(expected_ids):
            for question_id, row in zip(expected_ids, scored, strict=True):
                row.question_id = question_id
        else:
            raise GeminiError("Gemini evaluation did not cover every answer. Try again.")

    evaluations = []
    scores: list[float] = []
    for row in scored:
        score = _clamp(row.score)
        scores.append(score)
        evaluations.append(
            {
                "question_id": row.question_id,
                "score": score,
                "badge": _badge(score, row.badge),
                "key_strengths": row.key_strengths or ["The answer addresses the prompt."],
                "areas_for_improvement": row.areas_for_improvement or ["Add the missing edge case."],
                "ideal_answer_summary": row.ideal_answer_summary,
            }
        )

    overall = round(sum(scores) / len(scores), 1) if scores else 0.0
    pillars = _pillars(result.pillars, overall)
    drills = [
        {"title": drill.title, "detail": drill.detail, "chips": drill.chips}
        for drill in result.drills
        if drill.title and drill.detail
    ]
    return {
        "overall_score": overall,
        "summary": result.summary,
        "pillars": pillars,
        "drills": drills,
        "question_evaluations": evaluations,
    }


def request_hint(topic: str, title: str, prompt: str) -> str:
    text = (
        "Give one short interview hint.\n"
        "Do not include the full solution, the final code, or the complete algorithm.\n"
        f"Topic: {topic}\n"
        f"Title: {title}\n"
        f"Prompt: {prompt}"
    )
    result = _generate(text, HintOut)
    hint = result.hint.strip()
    if not hint:
        raise GeminiError("Gemini returned an empty hint. Try again.")
    return hint


def _generate(prompt: str, schema: type[BaseModel]) -> BaseModel:
    require_gemini()
    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        raise GeminiError("The Gemini client is not installed.") from exc

    client = genai.Client(api_key=config.settings.gemini_api_key.strip())
    try:
        response = client.models.generate_content(
            model=config.settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
                temperature=0.4,
            ),
        )
    except Exception as exc:
        raise GeminiError("Gemini could not complete the request. Try again.") from exc

    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, schema):
        return parsed
    if getattr(response, "text", None):
        return schema.model_validate_json(response.text)
    raise GeminiError("Gemini returned an empty response. Try again.")


def _clamp(score: float) -> float:
    return round(min(10.0, max(0.0, float(score))), 1)


def _badge(score: float, raw: str) -> str:
    if raw in BADGES:
        return raw
    if score < 5:
        return "Needs Work"
    if score < 8:
        return "Good"
    return "Excellent"


def _pillars(rows: list[PillarOut], overall: float) -> list[dict]:
    names = ("Accuracy", "Completeness", "Clarity")
    by_name = {row.name: row for row in rows}
    pillars = []
    for name in names:
        row = by_name.get(name)
        pillars.append(
            {
                "name": name,
                "score": _clamp(row.score) if row else overall,
                "detail": row.detail if row and row.detail else f"{name} for this interview.",
            }
        )
    return pillars
