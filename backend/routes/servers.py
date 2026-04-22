import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from database import db
from models.servers import Server, ServerCreate, ServerUpdate

router = APIRouter(prefix="/servers", tags=["servers"])


def _server_collection():
    return db["servers"]


def _get_server_or_404(server_id: str):
    server = _server_collection().find_one({"_id": server_id})
    if server is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Server with id '{server_id}' not found",
        )
    return server


@router.get("", response_model=List[Server])
def list_servers():
    servers = list(_server_collection().find({}))
    return servers


@router.get("/{server_id}", response_model=Server)
def get_server(server_id: str):
    return _get_server_or_404(server_id)


@router.post("", response_model=Server, status_code=status.HTTP_201_CREATED)
def create_server(server: ServerCreate):
    collection = _server_collection()
    server_data = server.dict(by_alias=True)
    server_data["_id"] = f"s{uuid.uuid4().hex[:8]}"
    
    collection.insert_one(server_data)
    return server_data


@router.put("/{server_id}", response_model=Server)
def update_server(server_id: str, server_update: ServerUpdate):
    existing_server = _get_server_or_404(server_id)
    updated_data = server_update.dict(by_alias=True, exclude_unset=True, exclude_none=True)
    
    if not updated_data:
        return existing_server
    
    _server_collection().update_one({"_id": server_id}, {"$set": updated_data})
    existing_server.update(updated_data)
    return existing_server


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(server_id: str):
    result = _server_collection().delete_one({"_id": server_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Server with id '{server_id}' not found",
        )
    return None