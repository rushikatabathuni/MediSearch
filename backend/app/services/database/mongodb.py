from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            # Test connection
            await cls.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        if not cls.client:
            raise RuntimeError("MongoDB client not initialized")
        return cls.client[settings.MONGODB_DB_NAME]
    
    @classmethod
    def get_collection(cls, collection_name: str):
        """Get collection instance"""
        db = cls.get_database()
        return db[collection_name]

# Collection names
USERS_COLLECTION = "users"
SEARCH_HISTORY_COLLECTION = "search_history"
