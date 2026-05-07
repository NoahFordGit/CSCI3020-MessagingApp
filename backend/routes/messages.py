import uuid
from datetime import datetime
from typing import List, Optional
from fastapi.concurrency import run_in_threadpool

from fastapi import APIRouter, HTTPException, status, Query

from database import db
from models.messages import Message, MessageCreate, MessageBase

router = APIRouter(prefix="/messages", tags=["messages"])


def _messages_collection():
    return db["messages"]


def _users_collection():
    return db["users"]


def _get_message_or_404(message_id: str):
    message = _messages_collection().find_one({"_id": message_id})
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with id '{message_id}' not found",
        )
    return message


@router.get("", response_model=List[Message])
def list_messages(
    channel_id: Optional[str] = Query(None),
    limit: Optional[int] = Query(100)
):
    query = {}
    if channel_id:
        query["channelId"] = channel_id
    
    messages = list(
        _messages_collection()
        .find(query)
        .sort("timestamp", -1)
        .limit(limit)
    )
    return sorted(messages, key=lambda x: x.get("timestamp", datetime.now()))


# Aggregation/Search Routes - MUST BE BEFORE /{message_id}

@router.get("/search/content")
async def search_by_content(content: str = Query(...), channel_id: str = Query(None)):
    """Search messages by content"""
    pipeline = [
        {"$match": {"content": {"$regex": content, "$options": "i"}}},
        {"$sort": {"timestamp": -1}}
    ]
    
    if channel_id:
        pipeline[0]["$match"]["channelId"] = channel_id

    cursor = await run_in_threadpool(lambda: _messages_collection().aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results


@router.get("/search/author")
async def search_by_author(username: str = Query(...), channel_id: str = Query(None)):
    """Search messages by author username"""
    # First, find the user by username
    user = _users_collection().find_one({"username": username})
    if not user:
        return []
    
    author_id = user.get("_id") or user.get("id")
    pipeline = [
        {"$match": {"authorId": author_id}},
        {"$sort": {"timestamp": -1}}
    ]
    
    if channel_id:
        pipeline[0]["$match"]["channelId"] = channel_id

    cursor = await run_in_threadpool(lambda: _messages_collection().aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results


@router.get("/search/time-range")
async def search_by_time_range(
    channel_id: str = Query(...),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    """Search messages by date range"""
    pipeline = [
        {"$match": {"channelId": channel_id}},
        {"$sort": {"timestamp": -1}}
    ]
    
    date_match = {}
    try:
        if start_date:
            date_match["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            end = datetime.fromisoformat(end_date)
            date_match["$lt"] = datetime(end.year, end.month, end.day, 23, 59, 59)
    except:
        pass
    
    if date_match:
        pipeline[0]["$match"]["timestamp"] = date_match

    cursor = await run_in_threadpool(lambda: _messages_collection().aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results


@router.get("/{message_id}", response_model=Message)
def get_message(message_id: str):
    return _get_message_or_404(message_id)


@router.post("", response_model=Message, status_code=status.HTTP_201_CREATED)
def create_message(message: MessageBase):
    collection = _messages_collection()
    message_data = message.dict(by_alias=True)
    message_data["_id"] = f"m{uuid.uuid4().hex[:8]}"
    message_data["timestamp"] = datetime.now()
    
    collection.insert_one(message_data)
    return message_data


@router.put("/{message_id}", response_model=Message)
def update_message(message_id: str, message_update: MessageBase):
    existing_message = _get_message_or_404(message_id)
    updated_data = message_update.dict(by_alias=True, exclude_unset=True, exclude_none=True)
    
    if not updated_data:
        return existing_message
    
    _messages_collection().update_one({"_id": message_id}, {"$set": updated_data})
    existing_message.update(updated_data)
    return existing_message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: str):
    result = _messages_collection().delete_one({"_id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with id '{message_id}' not found",
        )
    return None
