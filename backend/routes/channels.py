import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Query

from database import db
from models.channels import Channel, ChannelCreate, ChannelBase

router = APIRouter(prefix="/channels", tags=["channels"])


def _channels_collection():
    return db["channels"]


def _get_channel_or_404(channel_id: str):
    channel = _channels_collection().find_one({"_id": channel_id})
    if channel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel with id '{channel_id}' not found",
        )
    return channel


@router.get("", response_model=List[Channel])
def list_channels(server_id: Optional[str] = Query(None)):
    query = {}
    if server_id:
        query["serverId"] = server_id
    
    channels = list(_channels_collection().find(query))
    return channels


@router.get("/{channel_id}", response_model=Channel)
def get_channel(channel_id: str):
    return _get_channel_or_404(channel_id)


@router.post("", response_model=Channel, status_code=status.HTTP_201_CREATED)
def create_channel(channel: ChannelCreate):
    collection = _channels_collection()
    channel_data = channel.dict(by_alias=True)
    channel_data["_id"] = f"c{uuid.uuid4().hex[:8]}"
    
    collection.insert_one(channel_data)
    return channel_data


@router.put("/{channel_id}", response_model=Channel)
def update_channel(channel_id: str, channel_update: ChannelBase):
    existing_channel = _get_channel_or_404(channel_id)
    updated_data = channel_update.dict(by_alias=True, exclude_unset=True, exclude_none=True)
    
    if not updated_data:
        return existing_channel
    
    _channels_collection().update_one({"_id": channel_id}, {"$set": updated_data})
    existing_channel.update(updated_data)
    return existing_channel


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_channel(channel_id: str):
    result = _channels_collection().delete_one({"_id": channel_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel with id '{channel_id}' not found",
        )
    return None
