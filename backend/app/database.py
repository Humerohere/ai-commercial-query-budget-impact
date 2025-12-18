"""
MongoDB database connection management using Motor (async driver)
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global database client
_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the database instance
    
    Returns:
        AsyncIOMotorDatabase: The MongoDB database instance
        
    Raises:
        RuntimeError: If database is not connected
    """
    if _database is None:
        raise RuntimeError("Database is not connected. Call connect_to_mongo() first.")
    return _database


async def connect_to_mongo() -> None:
    """
    Connect to MongoDB Atlas and verify the connection
    
    This function should be called during application startup.
    """
    global _client, _database
    
    try:
        logger.info("Connecting to MongoDB...")
        
        # Create MongoDB client
        _client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000
        )
        
        # Get database name from URI or use default
        _database = _client.get_default_database()
        
        # Verify connection with ping
        await _client.admin.command('ping')
        
        logger.info(f"Successfully connected to MongoDB database: {_database.name}")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise


async def close_mongo_connection() -> None:
    """
    Close the MongoDB connection
    
    This function should be called during application shutdown.
    """
    global _client, _database
    
    if _client is not None:
        try:
            logger.info("Closing MongoDB connection...")
            _client.close()
            _client = None
            _database = None
            logger.info("MongoDB connection closed successfully")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {str(e)}")
            raise


async def ping_database() -> bool:
    """
    Ping the database to check if connection is alive
    
    Returns:
        bool: True if database is connected and responsive, False otherwise
    """
    try:
        if _client is None:
            return False
        await _client.admin.command('ping')
        return True
    except Exception as e:
        logger.error(f"Database ping failed: {str(e)}")
        return False