from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import SearchRequest, SearchResponse, HealthCheck
from app.services.rag.rag_pipeline import RAGPipeline
from app.services.agents.multi_agent_system import MultiAgentValidator
from app.services.database.search_history import SearchHistoryService
from app.api.dependencies import get_current_user_optional
import time
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services (singleton pattern)
_rag_pipeline = None
_validator = None

def get_rag_pipeline() -> RAGPipeline:
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline

def get_validator() -> MultiAgentValidator:
    global _validator
    if _validator is None:
        _validator = MultiAgentValidator()
    return _validator

@router.post("/search", response_model=SearchResponse)
async def search_medical_literature(
    request: SearchRequest,
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline),
    validator: MultiAgentValidator = Depends(get_validator),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Search medical literature with RAG and multi-agent validation"""
    start_time = time.time()
    
    try:
        logger.info(f"Search request: {request.query}")
        
        # Execute RAG search with hybrid retrieval
        answer, sources = await rag_pipeline.search(request)
        
        # Multi-agent validation
        validation = await validator.validate(
            query=request.query,
            answer=answer,
            sources=sources
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        # Build response
        response = SearchResponse(
            query=request.query,
            answer=answer,
            sources=sources,
            validation=validation,
            processing_time_ms=processing_time,
            timestamp=datetime.utcnow()
        )
        
        # Save history if authenticated
        if current_user:
            user_id = str(current_user["_id"])
            search_id = await SearchHistoryService.save_search(
                user_id, response, request.filters
            )
            response.search_id = search_id
            logger.info(f"Search saved with ID: {search_id}")
        
        logger.info(f"Search completed in {processing_time:.0f}ms")
        return response
        
    except FileNotFoundError as e:
        logger.error(f"VectorDB not found: {e}")
        raise HTTPException(
            status_code=500,
            detail="Vector database not found. Please ensure ChromaDB is properly initialized."
        )
    except Exception as e:
        logger.error(f"Search error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )

@router.get("/health", response_model=HealthCheck)
async def health_check(rag_pipeline: RAGPipeline = Depends(get_rag_pipeline)):
    """Health check endpoint"""
    try:
        chromadb_healthy = rag_pipeline.collection.count() > 0
        groq_healthy = True  # Simplified check
        embedding_healthy = rag_pipeline.embedding_model is not None
        
        all_healthy = chromadb_healthy and groq_healthy and embedding_healthy
        
        return HealthCheck(
            status="healthy" if all_healthy else "degraded",
            timestamp=datetime.utcnow(),
            version="1.0.0",
            services={
                "chromadb": chromadb_healthy,
                "groq_api": groq_healthy,
                "embedding_model": embedding_healthy
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthCheck(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            version="1.0.0",
            services={
                "chromadb": False,
                "groq_api": False,
                "embedding_model": False
            }
        )
