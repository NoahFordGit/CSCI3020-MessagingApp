from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(..., description="User display name")
    email: EmailStr = Field(..., description="User email address")
    server_ids: Optional[List[str]] = Field(
        default_factory=list,
        alias="serverIds",
        description="List of server IDs the user belongs to",
    )


class UserCreate(UserBase):
    password: str = Field(..., description="User password")


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    server_ids: Optional[List[str]] = Field(
        None,
        alias="serverIds",
        description="List of server IDs the user belongs to",
    )


class User(UserBase):
    id: str = Field(..., alias="_id", description="Unique user ID")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "u1001",
                "username": "noahford",
                "email": "noah@example.com",
                "password": "hashed_password_123",
                "serverIds": ["s1001", "s1002"],
            }
        }
    }
