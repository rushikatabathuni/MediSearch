// Authentication Types
export interface UserCreate {
  email: string
  password: string
  full_name: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  is_active: boolean
}

export interface Token {
  access_token: string
  token_type: string
}

// Search Types
export interface SearchFilters {
  source_types?: ("pubmed" | "medline" | "clinical_trial" | "all")[]
  date_range?: {
    start_date?: string
    end_date?: string
  }
  study_types?: ("rct" | "meta-analysis" | "cohort" | "case-control" | "cross-sectional" | "all")[]
  mesh_terms?: string[]
}

export interface SearchRequest {
  query: string
  top_k?: number
  filters?: SearchFilters
}

export interface ValidationScore {
  confidence: number
  reasoning: string
  flags: string[]
}

export interface ClinicalExpertValidation extends ValidationScore {
  clinical_relevance: number
  safety_concerns: string[]
}

export interface StatisticalValidation extends ValidationScore {
  statistical_score: number
  methodology_notes: string
}

export interface ContradictionDetection extends ValidationScore {
  contradiction_level: "low" | "medium" | "high"
  conflicting_sources: string[]
}

export interface Source {
  paper_id: string
  title: string
  relevance_score: number
  chunk_text: string
  source: "pubmed" | "medline" | "clinical_trial"
  metadata: {
    title: string
    source: string
    journal?: string
    publication_date?: string
    mesh_terms?: string[]
    keywords?: string[]
  }
}

export interface SearchResponse {
  query: string
  answer: string
  sources: Source[]
  validation: {
    clinical_expert: ClinicalExpertValidation
    statistical_validator: StatisticalValidation
    contradiction_detector: ContradictionDetection
    overall_confidence: number
  }
  processing_time_ms: number
  timestamp: string
  search_id?: string
}

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  services: {
    chromadb: boolean
    groq_api: boolean
    embedding_model: boolean
  }
}

// History Types
export interface SearchHistoryItem {
  id: string
  user_id: string
  query: string
  answer: string
  sources_count: number
  overall_confidence: number
  filters?: SearchFilters
  created_at: string
}

export interface SearchHistoryResponse {
  total: number
  searches: SearchHistoryItem[]
}

// Compare Types
export interface CompareRequest {
  search_ids: string[]
}

export interface CompareItem {
  search_id: string
  query: string
  answer: string
  overall_confidence: number
  sources_count: number
}

export interface CompareResponse {
  comparisons: CompareItem[]
  created_at: string
}

// Citation Types
export interface CitationRequest {
  paper_ids: string[]
  format: "bibtex" | "apa" | "json"
}

export interface CitationResponse {
  format: string
  citations: string
}
