from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import CompareRequest, CompareResponse, ComparisonResult
from app.services.database.search_history import SearchHistoryService
from app.api.dependencies import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=CompareResponse)
async def compare_searches(
    request: CompareRequest,
    current_user: dict = Depends(get_current_user)
):
    """Compare multiple searches side-by-side"""
    user_id = str(current_user["_id"])
    
    comparisons = []
    
    for search_id in request.search_ids:
        search = await SearchHistoryService.get_search_by_id(search_id, user_id)
        
        if not search:
            raise HTTPException(
                status_code=404,
                detail=f"Search {search_id} not found"
            )
        
        comparisons.append(ComparisonResult(
            search_id=search_id,
            query=search["query"],
            answer=search["answer"],
            overall_confidence=search["overall_confidence"],
            sources_count=search["sources_count"]
        ))
    
    return CompareResponse(
        comparisons=comparisons,
        created_at=datetime.utcnow()
    )
