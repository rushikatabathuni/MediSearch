from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MediSearch"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MongoDB
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "medisearch"
    
    # ChromaDB
    CHROMADB_PATH: str = "./vectordb"
    CHROMADB_COLLECTION: str = "medical_literature"
    
    # Groq API
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    # Embedding Model
    EMBEDDING_MODEL: str = "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract"
    
    # RAG Configuration
    TOP_K_RETRIEVAL: int = 10
    MAX_CONTEXT_LENGTH: int = 2048
    TEMPERATURE: float = 0.7
    
    # Search History
    MAX_HISTORY_PER_USER: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
