import os
import tempfile

import pytest

from backend.storage import (
    ALLOWED_EXTENSIONS,
    ALLOWED_MIMETYPES,
    MAX_FILE_SIZE,
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
