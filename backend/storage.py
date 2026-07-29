import os
import uuid
from pathlib import Path

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def get_upload_dir() -> str:
    return os.environ.get("UPLOAD_DIR", "./uploads")


def validate_image(content_type: str, filename: str, size: int) -> None:
    if content_type not in ALLOWED_MIMETYPES:
        raise ValueError(
            f"Invalid file type: {content_type}. Allowed: {', '.join(ALLOWED_MIMETYPES)}"
        )

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Invalid file extension: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large: {size} bytes. Maximum: {MAX_FILE_SIZE} bytes")


def save_upload(file_content: bytes, original_filename: str, content_type: str) -> str:
    validate_image(content_type, original_filename, len(file_content))

    ext = Path(original_filename).suffix.lower()
    safe_name = f"{uuid.uuid4().hex}{ext}"
    upload_dir = Path(get_upload_dir())
    upload_dir.mkdir(parents=True, exist_ok=True)

    target = upload_dir / safe_name
    target.write_bytes(file_content)
    return safe_name
