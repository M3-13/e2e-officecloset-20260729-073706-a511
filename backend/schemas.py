from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ClothingItemCreate(BaseModel):
    name: str
    category: str
    description: str = ""
    color: str = ""


class ClothingItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None
    color: str | None = None
    image_filename: str | None = None


class ClothingItemOut(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    description: str
    color: str
    image_filename: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitCreate(BaseModel):
    name: str
    clothing_item_ids: list[int] = []


class OutfitOut(BaseModel):
    id: int
    user_id: int
    name: str
    created_at: datetime
    items: list[ClothingItemOut] = []

    model_config = {"from_attributes": True}
