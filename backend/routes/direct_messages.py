import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Query

from database import db
from models.direct_messages import DirectMessage, DirectMessageCreate, DirectMessageBase

router = APIRouter(prefix="/direct-messages", tags=["direct_messages"])


def _direct_messages_collection():
    return db["direct_messages"]


def _get_direct_message_or_404(dm_id: str):
    dm = _direct_messages_collection().find_one({"_id": dm_id})
    if dm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Direct message with id '{dm_id}' not found",
        )
    return dm


@router.get("", response_model=List[DirectMessage])
def list_direct_messages(
    user_id: Optional[str] = Query(None),
    other_user_id: Optional[str] = Query(None),
    limit: Optional[int] = Query(100)
):
    query = {}
    if user_id and other_user_id:
        # Find all messages between two users (either direction)
        query = {
            "$or": [
                {"authorId": user_id, "recipientId": other_user_id},
                {"authorId": other_user_id, "recipientId": user_id},
            ]
        }
    elif user_id:
        # Find all messages for this user (sent or received)
        query = {
            "$or": [
                {"authorId": user_id},
                {"recipientId": user_id},
            ]
        }
    
    messages = list(
        _direct_messages_collection()
        .find(query)
        .sort("timestamp", -1)
        .limit(limit)
    )
    return sorted(messages, key=lambda x: x.get("timestamp", datetime.now()))


@router.get("/{dm_id}", response_model=DirectMessage)
def get_direct_message(dm_id: str):
    return _get_direct_message_or_404(dm_id)


@router.post("", response_model=DirectMessage, status_code=status.HTTP_201_CREATED)
def create_direct_message(dm: DirectMessageBase):
    collection = _direct_messages_collection()
    dm_data = dm.dict(by_alias=True)
    dm_data["_id"] = f"dm{uuid.uuid4().hex[:8]}"
    dm_data["timestamp"] = datetime.now()
    
    collection.insert_one(dm_data)
    return dm_data


@router.put("/{dm_id}", response_model=DirectMessage)
def update_direct_message(dm_id: str, dm_update: DirectMessageBase):
    existing_dm = _get_direct_message_or_404(dm_id)
    updated_data = dm_update.dict(by_alias=True, exclude_unset=True, exclude_none=True)
    
    if not updated_data:
        return existing_dm
    
    _direct_messages_collection().update_one({"_id": dm_id}, {"$set": updated_data})
    existing_dm.update(updated_data)
    return existing_dm


@router.delete("/{dm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direct_message(dm_id: str):
    result = _direct_messages_collection().delete_one({"_id": dm_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Direct message with id '{dm_id}' not found",
        )
    return None
