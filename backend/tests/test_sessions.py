import sqlite3

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.database import configure_database, init_db
from app.main import app
import app.config as config_module


def _fake_questions(topics, level, question_count, focuses):
    rows = []
    for index in range(question_count):
        topic = topics[index % len(topics)]
        rows.append(
            {
                "topic": topic,
                "difficulty": "Medium",
                "title": f"{topic} question {index + 1}",
                "question_text": f"Explain {topic} for a {level} interviewer. Focus: {', '.join(focuses) or 'core skills'}.",
                "constraints": ["Stay inside the stated bounds."],
                "examples": [
                    {
                        "title": "Example 1",
                        "input": "sample",
                        "output": "result",
                        "explanation": "Walk the happy path.",
                    }
                ],
                "starters": {
                    "python": "# python\n",
                    "javascript": "// javascript\n",
                    "java": "// java\n",
                },
            }
        )
    return rows


def _fake_evaluation(items):
    evaluations = []
    scores = []
    for item in items:
        score = 8.0 if len(item["response"]) > 40 else 4.0
        scores.append(score)
        evaluations.append(
            {
                "question_id": item["question_id"],
                "score": score,
                "badge": "Good" if score >= 7 else "Needs Work",
                "key_strengths": ["The structure is easy to follow."],
                "areas_for_improvement": ["Name the trade-off out loud."],
                "ideal_answer_summary": "State the approach, the complexity, and one edge case.",
            }
        )
    overall = round(sum(scores) / len(scores), 1)
    return {
        "overall_score": overall,
        "summary": "Solid pass with room on the trade-offs.",
        "pillars": [
            {"name": "Accuracy", "score": overall, "detail": "The facts line up."},
            {"name": "Completeness", "score": overall, "detail": "The main path is covered."},
            {"name": "Clarity", "score": overall, "detail": "A reviewer can follow it."},
        ],
        "drills": [],
        "question_evaluations": evaluations,
    }


def _fake_hint(topic, title, prompt):
    return f"Look at the constraint in {title} before you write the loop."


@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    config_module.settings = Settings(
        database_path=str(db_path),
        cors_origins="http://localhost:3000",
        gemini_api_key="test-key",
    )
    monkeypatch.setattr("app.routers.sessions.generate_questions", _fake_questions)
    monkeypatch.setattr("app.routers.sessions.evaluate_answers", _fake_evaluation)
    monkeypatch.setattr("app.routers.sessions.request_hint", _fake_hint)
    configure_database(str(db_path))
    init_db()
    with TestClient(app) as test_client:
        yield test_client


def _answers(questions, response: str) -> dict:
    return {
        "answers": [
            {"question_id": question["id"], "response": response}
            for question in questions
        ]
    }


def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_session_and_list_questions(client: TestClient):
    created = client.post(
        "/api/v1/sessions",
        json={"topics": ["DSA", "Java"], "level": "mid", "question_count": 5, "focuses": ["Big-O Complexity"]},
    )
    assert created.status_code == 201
    body = created.json()
    assert body["status"] == "in_progress"
    assert body["topics"] == ["DSA", "Java"]

    questions = client.get(f"/api/v1/sessions/{body['id']}/questions")
    assert questions.status_code == 200
    rows = questions.json()["questions"]
    assert len(rows) == 5
    assert [row["topic"] for row in rows] == ["DSA", "Java", "DSA", "Java", "DSA"]
    assert all("score" not in row and "feedback" not in row for row in rows)
    assert all(row["question_text"] and row["title"] and row["difficulty"] for row in rows)
    assert rows[0]["starters"]["python"]
    assert rows[0]["examples"][0]["output"] == "result"


def test_unknown_topic_is_rejected(client: TestClient):
    response = client.post("/api/v1/sessions", json={"topics": ["Rust"]})
    assert response.status_code == 422


def test_duplicate_topics_are_stored_once(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["Express", "Express"]})
    assert created.status_code == 201
    assert created.json()["topics"] == ["Express"]
    questions = client.get(f"/api/v1/sessions/{created.json()['id']}/questions")
    rows = questions.json()["questions"]
    assert len(rows) == 5
    assert all(row["topic"] == "Express" for row in rows)


def test_missing_session_returns_404(client: TestClient):
    missing = "00000000-0000-0000-0000-000000000000"
    assert client.get(f"/api/v1/sessions/{missing}/questions").status_code == 404
    assert client.get(f"/api/v1/sessions/{missing}/evaluation").status_code == 404
    assert client.post(f"/api/v1/sessions/{missing}/questions/{missing}/hint").status_code == 404


def test_evaluation_before_submit_is_not_found(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["LLD"]})
    session_id = created.json()["id"]
    evaluation = client.get(f"/api/v1/sessions/{session_id}/evaluation")
    assert evaluation.status_code == 404


def test_submit_requires_every_question(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["HLD"]})
    session_id = created.json()["id"]
    questions = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"]
    partial = client.post(
        f"/api/v1/sessions/{session_id}/submit",
        json={"answers": [{"question_id": questions[0]["id"], "response": "Only one answer."}]},
    )
    assert partial.status_code == 422


def test_submit_and_evaluation_are_deterministic(client: TestClient):
    long_answer = "Explain the design with storage, an API, and a trade-off. " * 8
    short_answer = "Use a hash map."

    def run(answer: str) -> dict:
        created = client.post("/api/v1/sessions", json={"topics": ["DSA"], "question_count": 3})
        session_id = created.json()["id"]
        questions = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"]
        submitted = client.post(
            f"/api/v1/sessions/{session_id}/submit",
            json=_answers(questions, answer),
        )
        assert submitted.status_code == 200
        assert submitted.json()["status"] == "completed"
        evaluation = client.get(f"/api/v1/sessions/{session_id}/evaluation")
        assert evaluation.status_code == 200
        return evaluation.json()

    first = run(long_answer)
    second = run(long_answer)
    shorter = run(short_answer)

    assert first["question_evaluations"][0]["score"] == second["question_evaluations"][0]["score"]
    assert first["overall_score"] == second["overall_score"]
    assert shorter["overall_score"] < first["overall_score"]

    scores = [item["score"] for item in first["question_evaluations"]]
    assert first["overall_score"] == round(sum(scores) / len(scores), 1)
    assert all(0 <= score <= 10 for score in scores)
    assert len(first["pillars"]) == 3

    item = first["question_evaluations"][0]
    assert item["user_response"] == long_answer
    assert item["badge"] == "Good"
    assert item["feedback"]["key_strengths"]
    assert item["feedback"]["areas_for_improvement"]
    assert item["feedback"]["ideal_answer_summary"]


def test_stored_evaluation_does_not_call_the_model_again(client: TestClient, monkeypatch):
    calls = {"count": 0}

    def counting(items):
        calls["count"] += 1
        result = _fake_evaluation(items)
        result["summary"] = "Stored coach note."
        result["drills"] = [
            {"title": "Empty input", "detail": "Practice the zero-length case.", "chips": ["bounds"]}
        ]
        return result

    monkeypatch.setattr("app.routers.sessions.evaluate_answers", counting)
    created = client.post("/api/v1/sessions", json={"topics": ["Java"], "question_count": 3})
    session_id = created.json()["id"]
    questions = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"]
    submitted = client.post(
        f"/api/v1/sessions/{session_id}/submit",
        json=_answers(questions, "Walk the bean lifecycle and the proxy boundary."),
    )
    assert submitted.status_code == 200
    assert calls["count"] == 1

    first = client.get(f"/api/v1/sessions/{session_id}/evaluation")
    second = client.get(f"/api/v1/sessions/{session_id}/evaluation")
    assert first.status_code == 200
    assert second.json() == first.json()
    assert second.json()["summary"] == "Stored coach note."
    assert second.json()["drills"][0]["title"] == "Empty input"
    assert calls["count"] == 1


def test_missing_api_key_is_unavailable(client: TestClient):
    config_module.settings.gemini_api_key = ""
    created = client.post("/api/v1/sessions", json={"topics": ["DSA"]})
    assert created.status_code == 503
    assert "GEMINI_API_KEY" in created.json()["detail"]


def test_hint_returns_a_nudge(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["DSA"], "question_count": 3})
    session_id = created.json()["id"]
    question = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"][0]
    hint = client.post(f"/api/v1/sessions/{session_id}/questions/{question['id']}/hint")
    assert hint.status_code == 200
    assert hint.json()["hint"]
    assert "solution" not in hint.json()["hint"].lower()


def test_second_submit_is_rejected(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["Node.js"], "question_count": 3})
    session_id = created.json()["id"]
    questions = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"]
    payload = _answers(questions, "Async I/O stays off the main thread.")
    assert client.post(f"/api/v1/sessions/{session_id}/submit", json=payload).status_code == 200
    assert client.post(f"/api/v1/sessions/{session_id}/submit", json=payload).status_code == 409


def test_startup_adds_missing_columns(tmp_path, monkeypatch):
    db_path = tmp_path / "legacy.db"
    connection = sqlite3.connect(db_path)
    connection.execute(
        """
        CREATE TABLE sessions (
            id VARCHAR PRIMARY KEY,
            topics JSON NOT NULL,
            status VARCHAR NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
        """
    )
    connection.execute(
        """
        CREATE TABLE questions (
            id VARCHAR PRIMARY KEY,
            session_id VARCHAR NOT NULL,
            position INTEGER NOT NULL,
            topic VARCHAR NOT NULL,
            question_text TEXT NOT NULL,
            user_response TEXT,
            score FLOAT,
            feedback JSON
        )
        """
    )
    connection.commit()
    connection.close()

    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    config_module.settings = Settings(database_path=str(db_path), cors_origins="http://localhost:3000")
    configure_database(str(db_path))
    init_db()

    connection = sqlite3.connect(db_path)
    session_columns = {row[1] for row in connection.execute("PRAGMA table_info(sessions)")}
    question_columns = {row[1] for row in connection.execute("PRAGMA table_info(questions)")}
    connection.close()
    assert {"level", "question_count", "focuses", "overall_score", "summary", "pillars", "drills"} <= session_columns
    assert {"difficulty", "detail"} <= question_columns


def test_cors_allows_configured_origin(client: TestClient):
    response = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
