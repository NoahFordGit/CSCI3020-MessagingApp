import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from database import db
from models.users import User, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


def _user_collection():
    return db["users"]


def _get_user_or_404(user_id: str):
    user = _user_collection().find_one({"_id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found",
        )
    return user


@router.get("", response_model=List[User])
def list_users():
    users = list(_user_collection().find({}, {"password": 0}))
    return users


@router.get("/{user_id}", response_model=User)
def get_user(user_id: str):
    return _get_user_or_404(user_id)


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    collection = _user_collection()

    if collection.find_one({"username": user.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    if collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )

    user_data = user.dict(by_alias=True)
    user_data["_id"] = f"u{uuid.uuid4().hex[:8]}"

    collection.insert_one(user_data)
    return user_data


@router.put("/{user_id}", response_model=User)
def update_user(user_id: str, user_update: UserUpdate):
    existing_user = _get_user_or_404(user_id)
    updated_data = user_update.dict(by_alias=True, exclude_unset=True, exclude_none=True)

    if "username" in updated_data:
        duplicate = _user_collection().find_one(
            {"username": updated_data["username"], "_id": {"$ne": user_id}}
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists",
            )

    if "email" in updated_data:
        duplicate = _user_collection().find_one(
            {"email": updated_data["email"], "_id": {"$ne": user_id}}
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )

    if not updated_data:
        return existing_user

    _user_collection().update_one({"_id": user_id}, {"$set": updated_data})
    existing_user.update(updated_data)
    return existing_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str):
    result = _user_collection().delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found",
        )
    return None