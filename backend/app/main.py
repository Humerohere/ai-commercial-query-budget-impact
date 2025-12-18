"""
FastAPI application entry point
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import connect_to_mongo, close_mongo_connection, ping_database
from .routers import auth, scripts, budget

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting up application...")
    try:
        await connect_to_mongo()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    try:
        await close_mongo_connection()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")


# Initialize FastAPI application
app = FastAPI(
    title="AI Commercial Query Detection API",
    description="Backend API for AI Commercial Query Detection & Budget Impact Tool",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS middleware
# Using regex to allow any localhost port (robust for dev environment)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(scripts.router)
app.include_router(budget.router)


@app.get("/healthz")
async def health_check():
    """
    Health check endpoint that verifies database connectivity
    
    Returns:
        dict: Status information including database connection state
    """
    try:
        # Ping MongoDB to verify connection
        is_connected = await ping_database()
        
        if is_connected:
            return {
                "status": "ok",
                "database": "connected"
            }
        else:
            return {
                "status": "error",
                "database": "disconnected"
            }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }


@app.get("/")
async def root():
    """
    Root endpoint
    
    Returns:
        dict: Welcome message and API information
    """
    return {
        "message": "AI Commercial Query Detection API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/healthz"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True
    )