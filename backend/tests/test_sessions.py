import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.database import configure_database, init_db
from app.main import app
import app.config as config_module


@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    config_module.settings = Settings(database_path=str(db_path), cors_origins="http://localhost:3000")
    configure_database(str(db_path))
    init_db()
    with TestClient(app) as test_client:
        yield test_client


def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_session_and_list_questions(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["DSA", "Java"]})
    assert created.status_code == 201
    body = created.json()
    assert body["status"] == "in_progress"
    assert body["topics"] == ["DSA", "Java"]

    questions = client.get(f"/api/v1/sessions/{body['id']}/questions")
    assert questions.status_code == 200
    rows = questions.json()["questions"]
    assert len(rows) == 4
    assert [row["topic"] for row in rows] == ["DSA", "DSA", "Java", "Java"]
    assert all("score" not in row and "feedback" not in row for row in rows)
    assert all(row["question_text"] for row in rows)


def test_unknown_topic_is_rejected(client: TestClient):
    response = client.post("/api/v1/sessions", json={"topics": ["Rust"]})
    assert response.status_code == 422


def test_duplicate_topics_are_stored_once(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["Express", "Express"]})
    assert created.status_code == 201
    assert created.json()["topics"] == ["Express"]
    questions = client.get(f"/api/v1/sessions/{created.json()['id']}/questions")
    assert len(questions.json()["questions"]) == 2


def test_missing_session_returns_404(client: TestClient):
    missing = "00000000-0000-0000-0000-000000000000"
    assert client.get(f"/api/v1/sessions/{missing}/questions").status_code == 404
    assert client.get(f"/api/v1/sessions/{missing}/evaluation").status_code == 404


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
        created = client.post("/api/v1/sessions", json={"topics": ["DSA"]})
        session_id = created.json()["id"]
        questions = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"]
        submitted = client.post(
            f"/api/v1/sessions/{session_id}/submit",
            json={
                "answers": [
                    {"question_id": questions[0]["id"], "response": answer},
                    {"question_id": questions[1]["id"], "response": answer},
                ]
            },
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

    item = first["question_evaluations"][0]
    assert item["user_response"] == long_answer
    assert item["feedback"]["key_strengths"]
    assert item["feedback"]["areas_for_improvement"]
    assert item["feedback"]["ideal_answer_summary"]


def test_second_submit_is_rejected(client: TestClient):
    created = client.post("/api/v1/sessions", json={"topics": ["Node.js"]})
    session_id = created.json()["id"]
    questions = client.get(f"/api/v1/sessions/{session_id}/questions").json()["questions"]
    payload = {
        "answers": [
            {"question_id": question["id"], "response": "Async I/O stays off the main thread."}
            for question in questions
        ]
    }
    assert client.post(f"/api/v1/sessions/{session_id}/submit", json=payload).status_code == 200
    assert client.post(f"/api/v1/sessions/{session_id}/submit", json=payload).status_code == 409


def test_cors_allows_configured_origin(client: TestClient):
    response = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
