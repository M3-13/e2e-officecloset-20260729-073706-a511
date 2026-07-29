from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import ClothingItem, Outfit, User
from ..schemas import OutfitCreate, OutfitOut

router = APIRouter(prefix="/api/outfits", tags=["outfits"])

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=list[OutfitOut])
def list_outfits(
    db: SessionDep,
    current_user: CurrentUserDep,
):
    outfits = db.query(Outfit).filter(Outfit.user_id == current_user.id).all()
    return outfits


@router.post("", response_model=OutfitOut, status_code=status.HTTP_201_CREATED)
def create_outfit(
    data: OutfitCreate,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    if data.clothing_item_ids:
        items = (
            db.query(ClothingItem)
            .filter(
                ClothingItem.id.in_(data.clothing_item_ids),
            )
            .all()
        )
        found_ids = {item.id for item in items}
        for requested_id in data.clothing_item_ids:
            if requested_id not in found_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Clothing item {requested_id} not found or not yours",
                )
        for item in items:
            if item.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Clothing item {item.id} does not belong to you",
                )
    else:
        items = []

    outfit = Outfit(name=data.name, user_id=current_user.id)
    db.add(outfit)
    db.flush()
    outfit.items = items
    db.commit()
    db.refresh(outfit)
    return outfit


@router.get("/{outfit_id}", response_model=OutfitOut)
def get_outfit(
    outfit_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    if outfit.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this outfit",
        )
    return outfit


@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_outfit(
    outfit_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    if outfit.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this outfit",
        )
    db.delete(outfit)
    db.commit()
