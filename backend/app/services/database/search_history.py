from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.services.database.mongodb import MongoDB, SEARCH_HISTORY_COLLECTION
from app.models.schemas import SearchHistoryItem, SearchResponse, SearchFilters
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SearchHistoryService:
    
    @staticmethod
    async def save_search(user_id: str, search_response: SearchResponse, filters: Optional[SearchFilters] = None) -> str:
        """Save search to history"""
        collection = MongoDB.get_collection(SEARCH_HISTORY_COLLECTION)
        
        search_doc = {
            "user_id": user_id,
            "query": search_response.query,
            "answer": search_response.answer,
            "sources": [s.dict() for s in search_response.sources],
            "validation": search_response.validation.dict(),
            "sources_count": len(search_response.sources),
            "overall_confidence": search_response.validation.overall_confidence,
            "filters": filters.dict() if filters else None,
            "processing_time_ms": search_response.processing_time_ms,
            "created_at": search_response.timestamp
        }
        
        result = await collection.insert_one(search_doc)
        search_id = str(result.inserted_id)
        
        # Limit history per user
        await SearchHistoryService._cleanup_old_searches(user_id)
        
        logger.info(f"Saved search {search_id} for user {user_id}")
        return search_id
    
    @staticmethod
    async def get_user_history(user_id: str, limit: int = 20, skip: int = 0) -> List[SearchHistoryItem]:
        """Get user's search history"""
        collection = MongoDB.get_collection(SEARCH_HISTORY_COLLECTION)
        
        cursor = collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        searches = []
        async for doc in cursor:
            searches.append(SearchHistoryItem(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                query=doc["query"],
                answer=doc["answer"],
                sources_count=doc["sources_count"],
                overall_confidence=doc["overall_confidence"],
                filters=SearchFilters(**doc["filters"]) if doc.get("filters") else None,
                created_at=doc["created_at"]
            ))
        
        return searches
    
    @staticmethod
    async def get_search_by_id(search_id: str, user_id: str) -> Optional[dict]:
        """Get specific search by ID"""
        collection = MongoDB.get_collection(SEARCH_HISTORY_COLLECTION)
        
        try:
            search = await collection.find_one({
                "_id": ObjectId(search_id),
                "user_id": user_id
            })
            return search
        except Exception as e:
            logger.error(f"Error fetching search {search_id}: {e}")
            return None
    
    @staticmethod
    async def delete_search(search_id: str, user_id: str) -> bool:
        """Delete a search from history"""
        collection = MongoDB.get_collection(SEARCH_HISTORY_COLLECTION)
        
        try:
            result = await collection.delete_one({
                "_id": ObjectId(search_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting search {search_id}: {e}")
            return False
    
    @staticmethod
    async def get_history_count(user_id: str) -> int:
        """Get total count of user's searches"""
        collection = MongoDB.get_collection(SEARCH_HISTORY_COLLECTION)
        return await collection.count_documents({"user_id": user_id})
    
    @staticmethod
    async def _cleanup_old_searches(user_id: str):
        """Remove old searches if exceeds limit"""
        collection = MongoDB.get_collection(SEARCH_HISTORY_COLLECTION)
        
        count = await collection.count_documents({"user_id": user_id})
        
        if count > settings.MAX_HISTORY_PER_USER:
            # Get oldest searches to delete
            cursor = collection.find(
                {"user_id": user_id}
            ).sort("created_at", 1).limit(count - settings.MAX_HISTORY_PER_USER)
            
            ids_to_delete = [doc["_id"] async for doc in cursor]
            
            if ids_to_delete:
                await collection.delete_many({"_id": {"$in": ids_to_delete}})
                logger.info(f"Cleaned up {len(ids_to_delete)} old searches for user {user_id}")
