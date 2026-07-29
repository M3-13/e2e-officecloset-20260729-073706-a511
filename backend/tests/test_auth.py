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


def test_register_success():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    res = client.post(
        "/api/auth/register",
        json={"email": "alice@test.de", "username": "alice", "password": "secret123"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "alice@test.de"
    assert data["username"] == "alice"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    client.post(
        "/api/auth/register",
        json={"email": "dup@test.de", "username": "first", "password": "secret123"},
    )
    res = client.post(
        "/api/auth/register",
        json={"email": "dup@test.de", "username": "second", "password": "other456"},
    )
    assert res.status_code == 409
    assert "Email" in res.json()["detail"]


def test_register_duplicate_username():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    client.post(
        "/api/auth/register",
        json={"email": "first@test.de", "username": "dupuser", "password": "secret123"},
    )
    res = client.post(
        "/api/auth/register",
        json={"email": "second@test.de", "username": "dupuser", "password": "other456"},
    )
    assert res.status_code == 409
    assert "Username" in res.json()["detail"]


def test_login_success():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    client.post(
        "/api/auth/register",
        json={"email": "login@test.de", "username": "logintest", "password": "mypassword"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "login@test.de", "password": "mypassword"},
    )
    assert res.status_code == 200
    assert "session" in res.cookies


def test_login_wrong_password():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    client.post(
        "/api/auth/register",
        json={"email": "wrongpw@test.de", "username": "wrongpw", "password": "correct"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "wrongpw@test.de", "password": "wrong"},
    )
    assert res.status_code == 401
    # No PII leak — don't reveal which field was wrong
    assert "wrongpw@test.de" not in res.json()["detail"]


def test_me_authenticated():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    client.post(
        "/api/auth/register",
        json={"email": "me@test.de", "username": "meuser", "password": "pass123"},
    )
    client.post(
        "/api/auth/login",
        json={"email": "me@test.de", "password": "pass123"},
    )
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "me@test.de"
    assert data["username"] == "meuser"


def test_me_unauthenticated():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_logout_clears_session():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    client.post(
        "/api/auth/register",
        json={"email": "logout@test.de", "username": "logoutuser", "password": "pass123"},
    )
    client.post(
        "/api/auth/login",
        json={"email": "logout@test.de", "password": "pass123"},
    )
    res = client.post("/api/auth/logout")
    assert res.status_code == 200

    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_register_login_logout_flow():
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    res = client.post(
        "/api/auth/register",
        json={"email": "flow@test.de", "username": "flowuser", "password": "test123"},
    )
    assert res.status_code == 201
    assert res.json()["email"] == "flow@test.de"

    res = client.post(
        "/api/auth/login",
        json={"email": "flow@test.de", "password": "test123"},
    )
    assert res.status_code == 200

    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json()["email"] == "flow@test.de"

    res = client.post("/api/auth/logout")
    assert res.status_code == 200

    res = client.get("/api/auth/me")
    assert res.status_code == 401
