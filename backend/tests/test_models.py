from datetime import UTC, datetime

from backend.database import SessionLocal, init_db
from backend.models import ClothingItem, Outfit, User


def test_create_user():
    init_db()
    db = SessionLocal()
    try:
        user = User(
            email="test@example.com",
            username="testuser",
            password_hash="hashed_password",
            created_at=datetime.now(UTC),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.password_hash == "hashed_password"
    finally:
        db.close()


def test_user_clothing_items_relationship():
    init_db()
    db = SessionLocal()
    try:
        user = User(
            email="rel@example.com",
            username="reluser",
            password_hash="hash",
            created_at=datetime.now(UTC),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        item = ClothingItem(
            user_id=user.id,
            name="Red Dress",
            category="Dress",
            description="Evening gown",
            color="Red",
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        assert item in user.clothing_items
        assert item.owner == user
    finally:
        db.close()


def test_outfit_relationship():
    init_db()
    db = SessionLocal()
    try:
        user = User(
            email="outfit@example.com",
            username="outfituser",
            password_hash="hash",
            created_at=datetime.now(UTC),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        item1 = ClothingItem(user_id=user.id, name="Shirt", category="Top")
        item2 = ClothingItem(user_id=user.id, name="Jeans", category="Bottom")
        db.add(item1)
        db.add(item2)
        db.commit()
        db.refresh(item1)
        db.refresh(item2)

        outfit = Outfit(user_id=user.id, name="Casual Look")
        outfit.items = [item1, item2]
        db.add(outfit)
        db.commit()
        db.refresh(outfit)

        assert len(outfit.items) == 2
        assert outfit in user.outfits
        assert item1 in outfit.items
        assert item2 in outfit.items
    finally:
        db.close()


def test_cascade_delete_user():
    init_db()
    db = SessionLocal()
    try:
        user = User(
            email="cascade@example.com",
            username="cascadeuser",
            password_hash="hash",
            created_at=datetime.now(UTC),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id

        item = ClothingItem(user_id=user.id, name="Test Item", category="Test")
        db.add(item)
        db.commit()

        db.delete(user)
        db.commit()

        remaining = db.query(ClothingItem).filter(ClothingItem.user_id == user_id).count()
        assert remaining == 0
    finally:
        db.close()
