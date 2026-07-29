import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SESSION_SECRET", "test-secret-for-pytest")

import pytest

from backend.database import Base, _engine, init_db


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=_engine)
    init_db()
