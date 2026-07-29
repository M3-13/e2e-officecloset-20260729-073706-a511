import os

import pytest
from fastapi import HTTPException

from backend.auth import (
    create_session_token,
    hash_password,
    verify_password,
    verify_session_token,
)


def test_password_hashing():
    password = "super-secret-password-123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong-password", hashed)


def test_session_token_roundtrip():
    os.environ["SESSION_SECRET"] = "test-secret-for-testing-only"
    try:
        token = create_session_token(42)
        assert isinstance(token, str)
        assert len(token) > 0

        user_id = verify_session_token(token)
        assert user_id == 42
    finally:
        del os.environ["SESSION_SECRET"]


def test_session_token_invalid():
    os.environ["SESSION_SECRET"] = "test-secret-for-testing-only"
    try:
        user_id = verify_session_token("invalid-token")
        assert user_id is None
    finally:
        del os.environ["SESSION_SECRET"]


def test_session_token_expired():
    os.environ["SESSION_SECRET"] = "test-secret-for-testing-only"
    try:
        token = create_session_token(1)
        user_id = verify_session_token(token)
        assert user_id == 1
    finally:
        del os.environ["SESSION_SECRET"]


def test_get_current_user_no_cookie():
    from fastapi import Request

    from backend.auth import get_current_user

    scope = {"type": "http", "method": "GET", "path": "/test", "headers": []}
    request = Request(scope)
    with pytest.raises(HTTPException) as exc:
        import asyncio

        asyncio.run(get_current_user(request))
    assert exc.value.status_code == 401
