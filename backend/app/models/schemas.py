from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# ===== Authentication Models =====

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    is_active: bool = True

# ===== Search Models =====

class StudyType(str, Enum):
    RCT = "rct"
    META_ANALYSIS = "meta-analysis"
    COHORT = "cohort"
    CASE_CONTROL = "case-control"
    CROSS_SECTIONAL = "cross-sectional"
    ALL = "all"

class SourceType(str, Enum):
    PUBMED = "pubmed"
    MEDLINE = "medline"
    CLINICAL_TRIAL = "clinical_trial"
    ALL = "all"

class DateRange(BaseModel):
    start_date: Optional[str] = None  # YYYY-MM-DD or YYYY
    end_date: Optional[str] = None

class SearchFilters(BaseModel):
    source_types: Optional[List[SourceType]] = [SourceType.ALL]
    date_range: Optional[DateRange] = None
    study_types: Optional[List[StudyType]] = [StudyType.ALL]
    min_sample_size: Optional[int] = None
    mesh_terms: Optional[List[str]] = None

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500, description="Medical search query")
    top_k: int = Field(default=10, ge=1, le=50, description="Number of results")
    filters: Optional[SearchFilters] = None

class SourceEvidence(BaseModel):
    paper_id: str
    title: str
    relevance_score: float
    chunk_text: str
    source: str
    metadata: Dict[str, Any] = {}

class ValidationScore(BaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    flags: List[str] = []

class ClinicalValidation(ValidationScore):
    clinical_relevance: float = Field(..., ge=0.0, le=1.0)
    safety_concerns: List[str] = []

class StatisticalValidation(ValidationScore):
    statistical_score: float = Field(..., ge=0.0, le=1.0)
    methodology_notes: str = ""

class ContradictionAnalysis(ValidationScore):
    contradiction_level: str
    conflicting_sources: List[str] = []

class MultiAgentValidation(BaseModel):
    clinical_expert: ClinicalValidation
    statistical_validator: StatisticalValidation
    contradiction_detector: ContradictionAnalysis
    overall_confidence: float = Field(..., ge=0.0, le=1.0)

class SearchResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceEvidence]
    validation: MultiAgentValidation
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    search_id: Optional[str] = None  # For saved searches

# ===== Search History Models =====

class SearchHistoryItem(BaseModel):
    id: str
    user_id: str
    query: str
    answer: str
    sources_count: int
    overall_confidence: float
    filters: Optional[SearchFilters] = None
    created_at: datetime

class SearchHistoryResponse(BaseModel):
    total: int
    searches: List[SearchHistoryItem]

# ===== Comparison Models =====

class CompareRequest(BaseModel):
    search_ids: List[str] = Field(..., min_length=2, max_length=5)

class ComparisonResult(BaseModel):
    search_id: str
    query: str
    answer: str
    overall_confidence: float
    sources_count: int

class CompareResponse(BaseModel):
    comparisons: List[ComparisonResult]
    created_at: datetime

# ===== Citation Models =====

class CitationFormat(str, Enum):
    BIBTEX = "bibtex"
    APA = "apa"
    JSON = "json"

class CitationRequest(BaseModel):
    paper_ids: List[str]
    format: CitationFormat = CitationFormat.BIBTEX

class CitationResponse(BaseModel):
    format: str
    citations: str

# ===== Health Check =====

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, bool]
