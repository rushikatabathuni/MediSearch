from datetime import datetime
from typing import Optional
from app.services.database.mongodb import MongoDB, USERS_COLLECTION
from app.models.schemas import UserCreate, User
from app.core.security import get_password_hash, verify_password
import logging

logger = logging.getLogger(__name__)

class UserService:
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """Create new user"""
        collection = MongoDB.get_collection(USERS_COLLECTION)
        
        # Check if user exists
        existing = await collection.find_one({"email": user_data.email})
        if existing:
            raise ValueError("Email already registered")
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "hashed_password": get_password_hash(user_data.password),
            "full_name": user_data.full_name,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = await collection.insert_one(user_doc)
        user_doc["id"] = str(result.inserted_id)
        
        logger.info(f"Created user: {user_data.email}")
        
        return User(
            id=user_doc["id"],
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            created_at=user_doc["created_at"],
            is_active=user_doc["is_active"]
        )
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[dict]:
        """Authenticate user"""
        collection = MongoDB.get_collection(USERS_COLLECTION)
        
        user = await collection.find_one({"email": email})
        if not user:
            return None
        
        if not verify_password(password, user["hashed_password"]):
            return None
        
        return user
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email"""
        collection = MongoDB.get_collection(USERS_COLLECTION)
        return await collection.find_one({"email": email})
