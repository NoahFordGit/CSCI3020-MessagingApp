import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.concurrency import run_in_threadpool

from database import db

from models.messages import Message, MessageCreate, MessageBase

router = APIRouter(tags=["aggregations"])

# Endpoints for searching and showing query results


# Endpoint to show all messages that meet a certain content criteria
@router.get("/messages/search")
async def message_search(content: str):
    pipeline = [
        {"$match": {"content": {"$regex": content} }},
        {"$sort": {"timestamp": -1}}
    ]

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results
    #results = await db.messages.aggregate(pipeline)
    #return results



# Endpoint to get messages by user
@router.get("/messages/search/{author_id}")
async def message_search_user(author_id: str):
    pipeline = [
        {"$match":  {"author_id": author_id}},
        {"$sort": {"timestamp": -1}}
    ]

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results



# Endpoint to get messages by channel
@router.get("/messages/search/{channel_id}")
async def message_search_channel(channel_id: str):
    pipeline = [
        { "$match":  {"channel_id": channel_id} },
        { "$sort": {"timestamp": -1} }
    ]

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results




# Endpoints for direct messages

# Endpoint to get dms by content
@router.get("/direct_messages/search")
async def dm_search(content: str):
    pipeline = [
        {"$match": {"content": {"$regex": content} }},
        {"$sort": {"timestamp": -1}}
    ]

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results

# Endpoint to get dms by user
@router.get("/direct_messages/search/{author_id}")
async def message_search_user(author_id: str):
    pipeline = [
        {"$match":  {"author_id": author_id}},
        {"$sort": {"timestamp": -1}}
    ]

    cursor = await run_in_threadpool(lambda: db.messages.aggregate(pipeline))
    results = await run_in_threadpool(lambda: list(cursor))
    return results