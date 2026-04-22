from datetime import datetime

from pydantic import BaseModel, Field


class DirectMessageBase(BaseModel):
    content: str = Field(..., description="Content of direct message")
    author_id: str = Field(..., alias="authorId", description="User ID of author")
    recipient_id: str = Field(..., alias="recipientId", description="User ID of recipient")
    edited: bool = Field(False, description="Whether the direct message has been edited")


class DirectMessageCreate(DirectMessageBase):
    timestamp: datetime = Field(..., description="Time of message")


class DirectMessage(DirectMessageBase):
    id: str = Field(..., alias="_id", description="Unique message ID")
    timestamp: datetime = Field(..., description="Time of message")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "dm1001",
                "content": "Hey, are you working on the project?",
                "authorId": "u1001",
                "recipientId": "u1002",
                "timestamp": "2026-04-09T19:00:00Z",
                "edited": False,
            }
        }
    }
