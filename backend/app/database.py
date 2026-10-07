from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

_engine = None
_SessionLocal = None


class Base(DeclarativeBase):
    pass


def configure_database(database_path: str | None = None) -> None:
    global _engine, _SessionLocal

    path = database_path or settings.database_path
    db_file = Path(path)
    if db_file.parent and str(db_file.parent) not in ("", "."):
        db_file.parent.mkdir(parents=True, exist_ok=True)

    if _engine is not None:
        _engine.dispose()

    _engine = create_engine(
        f"sqlite:///{path}",
        connect_args={"check_same_thread": False},
    )
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)


def get_engine():
    if _engine is None:
        configure_database()
    return _engine


def get_db():
    if _SessionLocal is None:
        configure_database()
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


_ADDED_COLUMNS = {
    "sessions": {
        "level": "VARCHAR NOT NULL DEFAULT 'mid'",
        "question_count": "INTEGER NOT NULL DEFAULT 5",
        "focuses": "TEXT NOT NULL DEFAULT '[]'",
        "overall_score": "FLOAT",
        "summary": "TEXT",
        "pillars": "TEXT",
        "drills": "TEXT",
    },
    "questions": {
        "difficulty": "VARCHAR NOT NULL DEFAULT 'Medium'",
        "detail": "TEXT",
    },
}


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=get_engine())
    _ensure_columns()


def _ensure_columns() -> None:
    with get_engine().begin() as connection:
        for table, columns in _ADDED_COLUMNS.items():
            rows = connection.execute(text(f"PRAGMA table_info({table})")).fetchall()
            if not rows:
                continue
            existing = {row[1] for row in rows}
            for name, column_type in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {column_type}"))
