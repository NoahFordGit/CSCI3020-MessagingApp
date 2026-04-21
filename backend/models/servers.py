from typing import List, Optional

from pydantic import BaseModel, Field

from database import db

from fastapi import FastAPI, Request, HTTPException, Response

app = FastAPI()

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


# ENDPOINTS START HERE

"""
Endpoint Overview for servers.py:

Note: place a tabbed X by each completed endpoint

GET /servers                        
GET /servers/{serverId}
POST /servers
PUT /servers/{serverId}
DELETE /servers/{serverId}
GET /servers/{serverId}/channels

"""


# servers.py
# GET /servers
# GET /servers/{serverId}
# POST /servers
# PUT /servers/{serverId}
# DELETE /servers/{serverId}
# GET /servers/{serverId}/channels
#


# GET /servers Endpoint
@app.get(f"/servers", response_model=Server)
async def get_servers(user_id):
    return


# GET /servers/{serverId}
@app.get(f"/servers/{Server.id}", response_model=Server)
async def get_server(serverId: str):
    return


# POST /servers
@app.post(f"/servers", response_model=Server)
async def post_servers(servers: Server):
    return


# PUT /servers/{serverId}
@app.put(f"/servers/{Server: id}", response_model=Server)
async def put_servers(serverId):
    return


# DELETE /servers/{serverId}
@app.delete(f"/servers/{Server: id}", response_model=Server)
async def delete_servers(serverId):
    return


# GET /servers/{serverId}/channels
@app.get(f"/servers/{Server: id}/channels", response_model=Server)
async def get_servers_channel(serverId):
    return