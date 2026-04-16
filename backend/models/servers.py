from typing import List, Optional

from pydantic import BaseModel, Field


class ServerBase(BaseModel):
    name: str = Field(..., description="Server name")
    description: Optional[str] = Field(None, description="Server description")
    owner_id: str = Field(..., alias="ownerId", description="User ID of owner")
    channel_ids: List[str] = Field(..., alias="channelIds", description="List of channel IDs")
    user_ids: List[str] = Field(..., alias="users", description="List of user IDs")


class ServerCreate(ServerBase):
    pass


class ServerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[str] = Field(None, alias="ownerId")
    channel_ids: Optional[List[str]] = Field(None, alias="channelIds")
    user_ids: Optional[List[str]] = Field(None, alias="users")


class Server(ServerBase):
    id: str = Field(..., alias="_id", description="Unique server ID")

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "_id": "s1001",
                "name": "CSCI Study Group",
                "description": "Server for class collaboration",
                "ownerId": "u1001",
                "channelIds": ["c1001", "c1002"],
                "users": ["u1001", "u1002"],
            }
        }
