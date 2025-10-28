from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.schemas import SearchHistoryItem, SearchHistoryResponse
from app.services.database.search_history import SearchHistoryService
from app.api.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=SearchHistoryResponse)
async def get_search_history(
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get user's search history"""
    user_id = str(current_user["_id"])
    
    searches = await SearchHistoryService.get_user_history(user_id, limit, skip)
    total = await SearchHistoryService.get_history_count(user_id)
    
    return SearchHistoryResponse(total=total, searches=searches)

@router.get("/{search_id}")
async def get_search_detail(
    search_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific search details"""
    user_id = str(current_user["_id"])
    
    search = await SearchHistoryService.get_search_by_id(search_id, user_id)
    
    if not search:
        raise HTTPException(status_code=404, detail="Search not found")
    
    # Convert ObjectId to string for JSON serialization
    search["_id"] = str(search["_id"])
    
    # Convert datetime objects to ISO format strings
    if "created_at" in search:
        search["created_at"] = search["created_at"].isoformat()
    if "timestamp" in search:
        search["timestamp"] = search["timestamp"].isoformat()
    
    return search

@router.delete("/{search_id}")
async def delete_search(
    search_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a search from history"""
    user_id = str(current_user["_id"])
    
    deleted = await SearchHistoryService.delete_search(search_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Search not found")
    
    return {"message": "Search deleted successfully"}
