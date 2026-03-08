"""
Ask The Tarot - Main FastAPI Application
US-001: AI Gatekeeper - Content Filtering
US-002: Intelligent Spread Selection
US-003: Follow-up Questions & Session Continuity
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import uuid
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from src.models.schemas import (
    ValidateQuestionRequest, 
    ValidateQuestionResponse,
    ValidationStatus,
    HealthResponse,
    DrawCardsRequest,
    DrawCardsResponse,
    SpreadType,
    FollowUpRequest,
    FollowUpResponse
)
from src.services.gatekeeper import GatekeeperService
from src.services.rate_limiter import RateLimiter
from src.services.card_drawing import CardDrawingService
from src.database.database import engine, init_db, SessionLocal
from src.database.models import Session as SessionModel, Interaction, Reading


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    init_db()
    app.state.gatekeeper = GatekeeperService()
    app.state.rate_limiter = RateLimiter()
    app.state.card_drawing = CardDrawingService()
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

def get_card_drawing(request: Request) -> CardDrawingService:
    """Get card drawing service from app state"""
    return request.app.state.card_drawing


# ============== US-001: Question Validation ==============

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


# ============== US-002: Card Drawing ==============

@app.post("/api/v1/draw-cards", response_model=DrawCardsResponse)
async def draw_cards(
    request: DrawCardsRequest,
    http_request: Request,
    card_drawing: CardDrawingService = Depends(get_card_drawing),
    rate_limiter: RateLimiter = Depends(get_rate_limiter)
):
    """
    Draw tarot cards for a reading
    
    - Creates session if it doesn't exist
    - Draws cards using cryptographically secure random
    - Each card has 50% chance of being reversed
    - Saves reading to database
    - Returns drawn cards with meanings
    """
    # Get client IP
    client_ip = http_request.client.host
    
    # Check rate limit (separate from question validation)
    rate_limit_key = f"{client_ip}:{request.session_id}:draw"
    if not await rate_limiter.check_rate_limit(rate_limit_key):
        raise HTTPException(
            status_code=429,
            detail={
                "status": "rate_limited",
                "message": "กรุณารอสักครู่ ก่อนเปิดไพ่อีกครั้ง",
                "retry_after": 60
            }
        )
    
    # Create or update session
    db = SessionLocal()
    try:
        session = db.query(SessionModel).filter(SessionModel.id == request.session_id).first()
        if not session:
            # Create new session
            session = SessionModel(
                id=request.session_id,
                ip_address=client_ip,
                status="active",
                follow_up_count=0
            )
            db.add(session)
            db.commit()
        else:
            # Update last activity
            session.last_activity = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()
    
    # Draw cards
    result = await card_drawing.draw_cards(request)
    
    return result


@app.get("/api/v1/spreads")
async def get_spreads(
    card_drawing: CardDrawingService = Depends(get_card_drawing)
):
    """
    Get available spread types
    
    Returns information about all available tarot spreads
    """
    spreads = []
    for spread_type in SpreadType:
        info = card_drawing.get_spread_info(spread_type)
        spreads.append({
            "type": spread_type.value,
            "name": info.name,
            "name_th": info.name_th,
            "card_count": info.card_count,
            "description": info.description,
            "description_th": info.description_th,
            "positions": info.positions,
            "positions_th": info.positions_th
        })
    
    return {"spreads": spreads}


@app.get("/api/v1/readings/{reading_id}")
async def get_reading(
    reading_id: str,
    session_id: str,
    card_drawing: CardDrawingService = Depends(get_card_drawing)
):
    """
    Get a reading by ID
    
    Returns the full reading including drawn cards
    """
    reading = await card_drawing.get_reading(reading_id, session_id)
    
    if not reading:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "not_found",
                "message": "Reading not found"
            }
        )
    
    return reading


@app.get("/api/v1/suggest-spread")
async def suggest_spread(
    question_type: str,
    card_drawing: CardDrawingService = Depends(get_card_drawing)
):
    """
    Suggest a spread based on question type
    
    - yes_no -> Single card
    - open_ended -> Three cards (PPF or MPC)
    """
    spread_type = card_drawing.suggest_spread(question_type)
    info = card_drawing.get_spread_info(spread_type)
    
    return {
        "question_type": question_type,
        "suggested_spread": {
            "type": spread_type.value,
            "name": info.name,
            "name_th": info.name_th,
            "card_count": info.card_count
        }
    }


# ============== US-003: Follow-up Questions ==============

@app.post("/api/v1/follow-up")
async def create_follow_up(
    request: Request,
    body: FollowUpRequest,
    gatekeeper: GatekeeperService = Depends(get_gatekeeper),
    rate_limiter: RateLimiter = Depends(get_rate_limiter)
):
    """
    Create a follow-up question with context
    
    - Validates follow-up limit (max 3 per session)
    - Checks session expiration (30 min timeout)
    - Passes context to AI for context-aware validation
    - Returns validation result with context summary
    """
    client_ip = request.client.host
    db = SessionLocal()
    
    try:
        # Get session
        session = db.query(SessionModel).filter(SessionModel.id == body.session_id).first()
        if not session:
            raise HTTPException(
                status_code=404,
                detail={"status": "error", "message": "ไม่พบเซสชัน"}
            )
        
        # Check session expiration (30 minutes)
        # Ensure we're comparing timezone-aware datetimes
        now = datetime.now(timezone.utc)
        last_activity = session.last_activity
        if last_activity.tzinfo is None:
            # If last_activity is naive, assume it's UTC
            last_activity = last_activity.replace(tzinfo=timezone.utc)
        
        if now - last_activity > timedelta(minutes=30):
            session.status = "expired"
            db.commit()
            raise HTTPException(
                status_code=403,
                detail={
                    "status": "session_expired",
                    "message": "เซสชันหมดอายุ กรุณาเริ่มต้นใหม่",
                    "started_at": session.started_at.isoformat()
                }
            )
        
        # Check follow-up limit (3 per session)
        if session.follow_up_count >= 3:
            raise HTTPException(
                status_code=429,
                detail={
                    "status": "limit_reached",
                    "message": "ถึงจำนวนคำถามต่อเนื่องสูงสุดแล้ว (3 ครั้ง)",
                    "follow_up_count": session.follow_up_count,
                    "max_allowed": 3
                }
            )
        
        # Check rate limit (5 min between follow-ups)
        rate_limit_key = f"{client_ip}:{body.session_id}:followup"
        if not await rate_limiter.check_rate_limit(rate_limit_key):
            raise HTTPException(
                status_code=429,
                detail={
                    "status": "rate_limited",
                    "message": "กรุณารอสักครู่ ก่อนถามคำถามต่อเนื่องอีกครั้ง",
                    "retry_after": 300  # 5 minutes
                }
            )
        
        # Get context from previous reading
        previous_reading = db.query(Reading).filter(Reading.id == body.previous_reading_id).first()
        context_summary = ""
        if previous_reading:
            context_summary = f"Previous reading: {previous_reading.question}"
        
        # Validate question with context
        validation_result = await gatekeeper.validate_question(
            question=body.question,
            language=body.language,
            session_id=body.session_id,
            context=context_summary  # Pass context for context-aware validation
        )
        
        # Generate follow-up response
        # TODO: In a real implementation, this would call an AI service
        # For now, we'll generate a simple response
        response_text = f"จากคำถามต่อเนื่องของคุณเกี่ยวกับ '{body.question}' - "
        if validation_result.status.value == "approved":
            response_text += "คำถามนี้สามารถถามได้ต่อเนื่องจากการอ่านไพ่ก่อนหน้า โดย AI จะพิจารณาบริบทจากไพ่ที่เปิดไปแล้ว"
        else:
            response_text += validation_result.message or "กรุณาลองถามใหม่"
        
        # Update session
        session.follow_up_count += 1
        session.last_activity = datetime.now()
        db.commit()
        
        # Create response
        follow_up_id = str(uuid.uuid4())
        return {
            "follow_up_id": follow_up_id,
            "session_id": body.session_id,
            "previous_reading_id": body.previous_reading_id,
            "new_reading_id": None,
            "question": body.question,
            "response": response_text,
            "context_summary": context_summary,
            "cards": None,
            "follow_up_count": session.follow_up_count,
            "remaining_follow_ups": 3 - session.follow_up_count,
            "max_follow_ups": 3,
            "created_at": datetime.now().isoformat()
        }
        
    finally:
        db.close()


@app.get("/api/v1/sessions/{session_id}/history")
async def get_session_history(
    session_id: str,
    request: Request
):
    """
    Get session interaction history
    
    Returns timeline of all interactions in the session
    """
    db = SessionLocal()
    
    try:
        # Get session
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=404,
                detail={"status": "error", "message": "Session not found"}
            )
        
        # Get interactions
        interactions = db.query(Interaction).filter(
            Interaction.session_id == session_id
        ).order_by(Interaction.sequence_number).all()
        
        return {
            "session_id": session_id,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "status": session.status,
            "follow_up_count": session.follow_up_count,
            "interactions": [
                {
                    "type": interaction.interaction_type,
                    "question": interaction.question,
                    "sequence": interaction.sequence_number,
                    "timestamp": interaction.created_at.isoformat() if interaction.created_at else None
                }
                for interaction in interactions
            ]
        }
        
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
