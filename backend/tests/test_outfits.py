import os

import pytest
from fastapi.testclient import TestClient

from backend.auth import create_session_token, hash_password
from backend.database import SessionLocal
from backend.main import app
from backend.models import ClothingItem, Outfit, User


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def user(db):
    u = User(
        email="test@example.com",
        username="testuser",
        password_hash=hash_password("password123"),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture
def token(user):
    os.environ["SESSION_SECRET"] = "test-secret-for-pytest"
    return create_session_token(user.id)


@pytest.fixture
def other_user(db):
    u = User(
        email="other@example.com",
        username="otheruser",
        password_hash=hash_password("password123"),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture
def clothing_items(db, user):
    items = [
        ClothingItem(user_id=user.id, name="Red Top", category="top", color="#FF0000"),
        ClothingItem(user_id=user.id, name="Black Skirt", category="bottom", color="#000000"),
        ClothingItem(user_id=user.id, name="Gold Heels", category="shoes", color="#C9A65A"),
    ]
    for item in items:
        db.add(item)
    db.commit()
    for item in items:
        db.refresh(item)
    return items


@pytest.fixture
def other_clothing_item(db, other_user):
    item = ClothingItem(user_id=other_user.id, name="Blue Dress", category="dress", color="#0000FF")
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def set_cookie(client, token):
    client.cookies.set("session", token)


class TestCreateOutfit:
    def test_create_with_items(self, client, token, user, clothing_items):
        set_cookie(client, token)
        item_ids = [item.id for item in clothing_items[:2]]

        response = client.post(
            "/api/outfits",
            json={"name": "Evening Look", "clothing_item_ids": item_ids},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Evening Look"
        assert data["user_id"] == user.id
        assert len(data["items"]) == 2

    def test_create_without_items(self, client, token):
        set_cookie(client, token)

        response = client.post(
            "/api/outfits",
            json={"name": "Empty Look", "clothing_item_ids": []},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Empty Look"
        assert len(data["items"]) == 0

    def test_reject_foreign_item(self, client, token, other_clothing_item):
        set_cookie(client, token)

        response = client.post(
            "/api/outfits",
            json={"name": "Stolen Look", "clothing_item_ids": [other_clothing_item.id]},
        )

        assert response.status_code == 403

    def test_reject_nonexistent_item(self, client, token):
        set_cookie(client, token)

        response = client.post(
            "/api/outfits",
            json={"name": "Ghost Look", "clothing_item_ids": [99999]},
        )

        assert response.status_code == 403


class TestListOutfits:
    def test_list_empty(self, client, token):
        set_cookie(client, token)

        response = client.get("/api/outfits")

        assert response.status_code == 200
        assert response.json() == []

    def test_list_with_outfits(self, client, token, user, clothing_items, db):
        outfit = Outfit(name="Casual Look", user_id=user.id)
        outfit.items = [clothing_items[0]]
        db.add(outfit)
        db.commit()

        set_cookie(client, token)
        response = client.get("/api/outfits")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Casual Look"
        assert len(data[0]["items"]) == 1


class TestGetOutfit:
    def test_get_own_outfit(self, client, token, user, clothing_items, db):
        outfit = Outfit(name="Date Night", user_id=user.id)
        outfit.items = clothing_items
        db.add(outfit)
        db.commit()
        db.refresh(outfit)

        set_cookie(client, token)
        response = client.get(f"/api/outfits/{outfit.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Date Night"
        assert len(data["items"]) == 3

    def test_get_foreign_outfit(self, client, token, other_user, db):
        outfit = Outfit(name="Secret Look", user_id=other_user.id)
        db.add(outfit)
        db.commit()
        db.refresh(outfit)

        set_cookie(client, token)
        response = client.get(f"/api/outfits/{outfit.id}")

        assert response.status_code in (403, 404)

    def test_get_nonexistent(self, client, token):
        set_cookie(client, token)
        response = client.get("/api/outfits/99999")
        assert response.status_code == 404


class TestDeleteOutfit:
    def test_delete_own_outfit(self, client, token, user, clothing_items, db):
        outfit = Outfit(name="To Delete", user_id=user.id)
        outfit.items = [clothing_items[0]]
        db.add(outfit)
        db.commit()
        db.refresh(outfit)
        outfit_id = outfit.id

        set_cookie(client, token)
        response = client.delete(f"/api/outfits/{outfit_id}")

        assert response.status_code == 204

        response = client.get(f"/api/outfits/{outfit_id}")
        assert response.status_code == 404

    def test_delete_foreign_outfit(self, client, token, other_user, db):
        outfit = Outfit(name="Not Mine", user_id=other_user.id)
        db.add(outfit)
        db.commit()
        db.refresh(outfit)

        set_cookie(client, token)
        response = client.delete(f"/api/outfits/{outfit.id}")

        assert response.status_code in (403, 404)

    def test_delete_nonexistent(self, client, token):
        set_cookie(client, token)
        response = client.delete("/api/outfits/99999")
        assert response.status_code == 404


class TestAuth:
    def test_requires_auth(self, client):
        response = client.get("/api/outfits")
        assert response.status_code == 401

    def test_requires_auth_for_create(self, client):
        response = client.post("/api/outfits", json={"name": "Nope", "clothing_item_ids": []})
        assert response.status_code == 401
