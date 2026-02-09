"""
TrialGuard FastAPI Application
Main entry point for the backend API server.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.api import protocol, analysis, chat, history
from app.services.historical_db import get_historical_db_service

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup: Load historical trials database
    logger.info("Starting TrialGuard backend...")
    logger.info(f"Loading historical trials database...")

    try:
        db_service = get_historical_db_service()
        await db_service.load_database()
        logger.info("Historical database loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load historical database: {e}")

    yield

    # Shutdown
    logger.info("Shutting down TrialGuard backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Clinical trial risk analysis powered by Google Gemini 3.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "healthy",
        "application": settings.app_name,
        "version": settings.app_version,
        "message": "TrialGuard API is running"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    db_service = get_historical_db_service()

    return {
        "status": "healthy",
        "database_loaded": db_service.loaded,
        "trials_count": len(db_service.trials),
        "gemini_configured": bool(settings.gemini_api_key)
    }


# Include routers
app.include_router(
    protocol.router,
    prefix=f"{settings.api_prefix}/protocol",
    tags=["Protocol"]
)

app.include_router(
    analysis.router,
    prefix=f"{settings.api_prefix}/analysis",
    tags=["Analysis"]
)

app.include_router(
    chat.router,
    prefix=f"{settings.api_prefix}/chat",
    tags=["Chat"]
)

app.include_router(
    history.router,
    prefix=f"{settings.api_prefix}/history",
    tags=["History"]
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An error occurred processing your request"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
