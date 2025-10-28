from fastapi import APIRouter
from app.api.v1.endpoints import search, auth, history, citations, compare

api_router = APIRouter()

# Public endpoints
api_router.include_router(
    search.router,
    prefix="/medical",
    tags=["Medical Search"]
)

# Auth endpoints
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Protected endpoints
api_router.include_router(
    history.router,
    prefix="/history",
    tags=["Search History"]
)

api_router.include_router(
    citations.router,
    prefix="/citations",
    tags=["Citations"]
)

api_router.include_router(
    compare.router,
    prefix="/compare",
    tags=["Compare"]
)
