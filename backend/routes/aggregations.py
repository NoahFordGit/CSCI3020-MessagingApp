import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.concurrency import run_in_threadpool

from database import db

from models.messages import Message, MessageCreate, MessageBase

router = APIRouter(tags=["aggregations"])

# Endpoints for searching and showing query results


# Endpoint to show all messages that meet a certain content criteria
@router.get("/filter/messages/search")
async def message_search(content: str = Query(...), channel_id: str = Query(None)):
    pipeline = [
        {"$match": {"content": {"$regex": content, "$options": "i"}}},
        {"$sort": {"timestamp": -1}}
    ]
    
    # If channel_id is provided, filter by channel
    if channel_id:
        pipeline[0]["$match"]["channel_id"] = channel_id

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results



# Endpoint to get messages by user/author
@router.get("/filter/messages/author")
async def message_search_author(author_id: str = Query(...), channel_id: str = Query(None)):
    pipeline = [
        {"$match": {"author_id": author_id}},
        {"$sort": {"timestamp": -1}}
    ]
    
    if channel_id:
        pipeline[0]["$match"]["channel_id"] = channel_id

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results



# Endpoint to get messages by time range
@router.get("/filter/messages/time-range")
async def message_search_time_range(
    channel_id: str = Query(...),
    start_date: str = Query(None),  # ISO format: 2026-01-01
    end_date: str = Query(None)     # ISO format: 2026-01-31
):
    pipeline = [
        {"$match": {"channel_id": channel_id}},
        {"$sort": {"timestamp": -1}}
    ]
    
    date_match = {}
    try:
        if start_date:
            date_match["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            # Add one day to include the entire end date
            end = datetime.fromisoformat(end_date)
            date_match["$lt"] = datetime(end.year, end.month, end.day, 23, 59, 59)
    except:
        pass
    
    if date_match:
        pipeline[0]["$match"]["timestamp"] = date_match

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results




# Endpoints for direct messages

# Endpoint to get dms by content
@router.get("/filter/direct_messages/search")
async def dm_search(content: str = Query(...)):
    pipeline = [
        {"$match": {"content": {"$regex": content, "$options": "i"}}},
        {"$sort": {"timestamp": -1}}
    ]

    cursor = await run_in_threadpool(lambda: db.direct_messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results

# Endpoint to get dms by user/author
@router.get("/filter/direct_messages/author")
async def dm_search_author(author_id: str = Query(...)):
    pipeline = [
        {"$match": {"author_id": author_id}},
        {"$sort": {"timestamp": -1}}
    ]

    cursor = await run_in_threadpool(lambda: db.direct_messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results


# Endpoint to get dms by time range
@router.get("/filter/direct_messages/time-range")
async def dm_search_time_range(
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    pipeline = [
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
        pipeline[0] = {"$match": {"timestamp": date_match}}

    cursor = await run_in_threadpool(lambda: db.direct_messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results