import os
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, Request, status
from itsdangerous import URLSafeTimedSerializer
from passlib.context import CryptContext

from .database import get_db
from .models import User

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

COOKIE_NAME = "session"
SESSION_MAX_AGE = timedelta(days=7)


def _cookie_secure() -> bool:
    return os.environ.get("ENVIRONMENT", "").lower() == "production"


def _get_secret() -> str:
    secret = os.environ.get("SESSION_SECRET")
    if not secret:
        raise RuntimeError(
            "SESSION_SECRET environment variable is not set. "
            "Set it in RUN.json or your environment."
        )
    return secret


def _get_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(_get_secret(), salt="session-cookie")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def create_session_token(user_id: int) -> str:
    s = _get_serializer()
    data = {"user_id": user_id, "iat": datetime.now(UTC).timestamp()}
    return s.dumps(data)


def verify_session_token(token: str) -> int | None:
    s = _get_serializer()
    try:
        data = s.loads(token, max_age=int(SESSION_MAX_AGE.total_seconds()))
        return data.get("user_id")
    except Exception:
        return None


async def get_current_user(request: Request) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = verify_session_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session"
        )

    db = next(get_db())
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    finally:
        db.close()
