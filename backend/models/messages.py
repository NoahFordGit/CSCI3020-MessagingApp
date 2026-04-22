from datetime import datetime

from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    content: str = Field(..., description="Content of message")
    author_id: str = Field(..., alias="authorId", description="User ID of author")
    channel_id: str = Field(..., alias="channelId", description="Channel ID for the message")
    edited: bool = Field(False, description="Whether the message has been edited")


class MessageCreate(MessageBase):
    timestamp: datetime = Field(..., description="Time of message")


class Message(MessageBase):
    id: str = Field(..., alias="_id", description="Unique message ID")
    timestamp: datetime = Field(..., description="Time of message")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "m1001",
                "content": "Hey everyone, welcome to the server!",
                "authorId": "u1001",
                "channelId": "c1001",
                "timestamp": "2026-04-09T18:00:00Z",
                "edited": False,
            }
        }
    }
