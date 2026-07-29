import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.auth import create_session_token, hash_password
from backend.database import get_db
from backend.main import app
from backend.models import ClothingItem, User
from backend.storage import (
    ALLOWED_EXTENSIONS,
    ALLOWED_MIMETYPES,
    MAX_FILE_SIZE,
    _sanitize_filename,
    get_upload_dir,
    save_upload,
    validate_image,
)


def test_get_upload_dir_default():
    assert get_upload_dir() == "./uploads"


def test_get_upload_dir_from_env():
    os.environ["UPLOAD_DIR"] = "/tmp/test-uploads"
    try:
        assert get_upload_dir() == "/tmp/test-uploads"
    finally:
        del os.environ["UPLOAD_DIR"]


def test_allowed_mimetypes():
    assert "image/jpeg" in ALLOWED_MIMETYPES
    assert "image/png" in ALLOWED_MIMETYPES
    assert "image/gif" in ALLOWED_MIMETYPES
    assert "image/webp" in ALLOWED_MIMETYPES


def test_allowed_extensions():
    assert ".jpg" in ALLOWED_EXTENSIONS
    assert ".jpeg" in ALLOWED_EXTENSIONS
    assert ".png" in ALLOWED_EXTENSIONS
    assert ".gif" in ALLOWED_EXTENSIONS
    assert ".webp" in ALLOWED_EXTENSIONS


def test_validate_image_valid():
    validate_image("image/jpeg", "photo.jpg", 1024)


def test_validate_image_invalid_mimetype():
    with pytest.raises(ValueError, match="Invalid file type"):
        validate_image("application/pdf", "doc.pdf", 1024)


def test_validate_image_invalid_extension():
    with pytest.raises(ValueError, match="Invalid file extension"):
        validate_image("image/jpeg", "photo.exe", 1024)


def test_validate_image_too_large():
    with pytest.raises(ValueError, match="File too large"):
        validate_image("image/jpeg", "photo.jpg", MAX_FILE_SIZE + 1)


def test_save_upload():
    os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
    try:
        content = b"fake-image-data"
        filename = save_upload(content, "test.jpg", "image/jpeg")
        assert filename.endswith(".jpg")
        assert len(filename) > 4

        filepath = os.path.join(get_upload_dir(), filename)
        assert os.path.exists(filepath)
        with open(filepath, "rb") as f:
            assert f.read() == content
    finally:
        import shutil

        shutil.rmtree(os.environ["UPLOAD_DIR"])
        del os.environ["UPLOAD_DIR"]


def test_sanitize_filename_rejects_dotdot():
    with pytest.raises(ValueError, match="path traversal"):
        _sanitize_filename("../evil.jpg")


def test_sanitize_filename_rejects_slash():
    with pytest.raises(ValueError, match="path traversal"):
        _sanitize_filename("foo/bar.jpg")


def test_sanitize_filename_rejects_backslash():
    with pytest.raises(ValueError, match="path traversal"):
        _sanitize_filename("foo\\bar.jpg")


def test_sanitize_filename_accepts_normal():
    _sanitize_filename("normal.jpg")


def _add_test_user(db, email="test@test.com", username="testuser"):
    user = User(
        email=email,
        username=username,
        password_hash=hash_password("pass"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_serve_image_requires_auth():
    os.environ["SESSION_SECRET"] = "test-secret-for-pytest"
    os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
    try:
        with TestClient(app) as client:
            response = client.get("/api/images/some.jpg")
            assert response.status_code == 401
    finally:
        import shutil

        shutil.rmtree(os.environ["UPLOAD_DIR"])
        del os.environ["UPLOAD_DIR"]
        del os.environ["SESSION_SECRET"]


def test_serve_image_returns_404_for_unknown():
    os.environ["SESSION_SECRET"] = "test-secret-for-pytest"
    os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
    try:
        user = _add_test_user(next(get_db()))
        token = create_session_token(user.id)
        with TestClient(app) as client:
            client.cookies.set("session", token)
            response = client.get("/api/images/nonexistent.jpg")
            assert response.status_code == 404
    finally:
        import shutil

        shutil.rmtree(os.environ["UPLOAD_DIR"])
        del os.environ["UPLOAD_DIR"]
        del os.environ["SESSION_SECRET"]


def test_serve_image_returns_403_for_foreign_owner():
    os.environ["SESSION_SECRET"] = "test-secret-for-pytest"
    os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
    try:
        db = next(get_db())
        owner = _add_test_user(db, "owner@test.com", "owner")
        intruder = _add_test_user(db, "intruder@test.com", "intruder")

        item = ClothingItem(
            user_id=owner.id,
            name="Dress",
            category="dress",
            image_filename="my-dress.jpg",
        )
        db.add(item)
        db.commit()

        upload_dir = Path(get_upload_dir())
        upload_dir.mkdir(parents=True, exist_ok=True)
        (upload_dir / "my-dress.jpg").write_text("fake-image-data")

        token = create_session_token(intruder.id)
        with TestClient(app) as client:
            client.cookies.set("session", token)
            response = client.get("/api/images/my-dress.jpg")
            assert response.status_code == 403
    finally:
        import shutil

        shutil.rmtree(os.environ["UPLOAD_DIR"])
        del os.environ["UPLOAD_DIR"]
        del os.environ["SESSION_SECRET"]


def test_serve_image_returns_file_for_owner():
    os.environ["SESSION_SECRET"] = "test-secret-for-pytest"
    os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
    try:
        db = next(get_db())
        user = _add_test_user(db)

        upload_dir = Path(get_upload_dir())
        upload_dir.mkdir(parents=True, exist_ok=True)
        (upload_dir / "my-dress.jpg").write_text("fake-image-data")

        item = ClothingItem(
            user_id=user.id,
            name="Dress",
            category="dress",
            image_filename="my-dress.jpg",
        )
        db.add(item)
        db.commit()

        token = create_session_token(user.id)
        with TestClient(app) as client:
            client.cookies.set("session", token)
            response = client.get("/api/images/my-dress.jpg")
            assert response.status_code == 200
            assert response.text == "fake-image-data"
    finally:
        import shutil

        shutil.rmtree(os.environ["UPLOAD_DIR"])
        del os.environ["UPLOAD_DIR"]
        del os.environ["SESSION_SECRET"]
