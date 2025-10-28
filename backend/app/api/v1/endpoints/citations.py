from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import CitationRequest, CitationResponse
from app.services.citation.citation_service import CitationService
from app.services.database.search_history import SearchHistoryService
from app.api.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=CitationResponse)
async def export_citations(
    request: CitationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Export citations in specified format"""
    user_id = str(current_user["_id"])
    
    # Fetch sources from search history
    sources = []
    for paper_id in request.paper_ids:
        # Parse search_id from paper_id format: "search_id:paper_id"
        if ":" in paper_id:
            search_id, _ = paper_id.split(":", 1)
            search = await SearchHistoryService.get_search_by_id(search_id, user_id)
            if search:
                sources.extend(search.get("sources", []))
    
    if not sources:
        raise HTTPException(status_code=404, detail="No sources found")
    
    # Format citations
    formatted = CitationService.format_multiple_citations(sources, request.format)
    
    return CitationResponse(
        format=request.format.value,
        citations=formatted
    )
