"""
Ask The Tarot - Main FastAPI Application
US-001: AI Gatekeeper - Content Filtering
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import uuid
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from src.models.schemas import (
    ValidateQuestionRequest, 
    ValidateQuestionResponse,
    ValidationStatus,
    HealthResponse
)
from src.services.gatekeeper import GatekeeperService
from src.services.rate_limiter import RateLimiter
from src.database.database import engine, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    init_db()
    app.state.gatekeeper = GatekeeperService()
    app.state.rate_limiter = RateLimiter()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Ask The Tarot API",
    description="AI-powered tarot reading application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="ask-the-tarot-api"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="ask-the-tarot-api"
    )


def get_gatekeeper(request: Request) -> GatekeeperService:
    """Get gatekeeper service from app state"""
    return request.app.state.gatekeeper

def get_rate_limiter(request: Request) -> RateLimiter:
    """Get rate limiter service from app state"""
    return request.app.state.rate_limiter


@app.post("/api/v1/validate-question", response_model=ValidateQuestionResponse)
async def validate_question(
    request: ValidateQuestionRequest,
    http_request: Request,
    gatekeeper: GatekeeperService = Depends(get_gatekeeper),
    rate_limiter: RateLimiter = Depends(get_rate_limiter)
):
    """
    Validate user question through AI Gatekeeper
    
    - Validates question content for appropriateness
    - Checks rate limits
    - Returns validation result with suggested spread type
    """
    # Get client IP
    client_ip = http_request.client.host
    
    # Check rate limit
    rate_limit_key = f"{client_ip}:{request.session_id or 'anon'}"
    if not await rate_limiter.check_rate_limit(rate_limit_key):
        raise HTTPException(
            status_code=429,
            detail={
                "status": "rate_limited",
                "message": "กรุณารอสักครู่ ก่อนถามคำถามถัดไป",
                "retry_after": 60
            }
        )
    
    # Validate question through AI Gatekeeper
    result = await gatekeeper.validate_question(
        question=request.question,
        language=request.language,
        session_id=request.session_id
    )
    
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
