from pathlib import Path

from sqlalchemy import create_engine
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


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=get_engine())
