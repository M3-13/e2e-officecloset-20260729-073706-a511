import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _get_database_url() -> str:
    return os.environ.get("DATABASE_URL", "sqlite:///./dev.db")


_engine = create_engine(
    _get_database_url(),
    connect_args={"check_same_thread": False} if "sqlite" in _get_database_url() else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=_engine)
