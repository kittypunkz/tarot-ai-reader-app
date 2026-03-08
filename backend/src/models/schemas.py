"""
Pydantic schemas for API requests/responses
US-001: AI Gatekeeper
US-002: Intelligent Spread Selection
US-003: Follow-up Questions
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Literal, List
from enum import Enum


class ValidationStatus(str, Enum):
    """Validation status enum"""
    APPROVED = "approved"
    REJECTED = "rejected"
    CLARIFICATION_NEEDED = "clarification_needed"


class RejectionReason(str, Enum):
    """Rejection reason enum"""
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    TOO_SHORT = "too_short"
    SPAM = "spam"
    UNCLEAR = "unclear"


class QuestionCategory(str, Enum):
    """Question category enum"""
    CAREER = "career"
    LOVE = "love"
    HEALTH = "health"
    GENERAL = "general"
    FINANCE = "finance"
    RELATIONSHIP = "relationship"


class QuestionType(str, Enum):
    """Question type enum"""
    YES_NO = "yes_no"
    OPEN_ENDED = "open_ended"
    ADVICE = "advice"


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    service: str


class ValidateQuestionRequest(BaseModel):
    """Request to validate a question"""
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="The question to validate"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Optional session ID for tracking"
    )
    language: str = Field(
        default="th",
        description="Language code (th, en)"
    )


class SuggestedSpread(BaseModel):
    """Suggested spread information"""
    spread_type: str
    name: str
    name_th: str
    card_count: int


class ValidateQuestionResponse(BaseModel):
    """Response from validating a question"""
    status: ValidationStatus
    confidence: float = Field(..., ge=0, le=1)
    category: Optional[QuestionCategory] = None
    question_type: Optional[QuestionType] = None
    suggested_spread: int = Field(..., ge=1, le=10)
    reason: Optional[RejectionReason] = None
    message: Optional[str] = None
    suggestion: Optional[str] = None
    examples: Optional[List[str]] = None


class CardOrientation(str, Enum):
    """Card orientation"""
    UPRIGHT = "upright"
    REVERSED = "reversed"


class SpreadType(str, Enum):
    """Types of tarot spreads"""
    SINGLE = "single"
    THREE_PPF = "three_ppf"  # Past, Present, Future
    THREE_MPC = "three_mpc"  # Mind, Body, Spirit (or similar 3-card)
    CELTIC_CROSS = "celtic_cross"


class DrawCardsRequest(BaseModel):
    """Request to draw cards"""
    session_id: str = Field(
        ...,
        description="Session identifier"
    )
    spread_type: SpreadType = Field(
        default=SpreadType.SINGLE,
        description="Type of spread to use"
    )
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="The question being asked"
    )
    language: str = Field(
        default="th",
        description="Language code (th, en)"
    )


class DrawnCard(BaseModel):
    """A drawn card"""
    position: int = Field(..., ge=0, description="Position in spread")
    position_name: str = Field(..., description="Name of position (e.g., 'Past', 'Present')")
    position_name_th: str = Field(..., description="Thai name of position")
    card_id: str = Field(..., description="Card identifier")
    card_name: str = Field(..., description="Card name")
    card_name_th: str = Field(..., description="Thai card name")
    orientation: CardOrientation = Field(default=CardOrientation.UPRIGHT)
    keywords: List[str] = Field(default_factory=list, description="Card keywords")
    keywords_th: List[str] = Field(default_factory=list, description="Thai keywords")
    meaning: str = Field(..., description="Card meaning in this position")
    meaning_th: str = Field(..., description="Thai meaning")
    image_url: Optional[str] = Field(None, description="Card image URL")


class SpreadInfo(BaseModel):
    """Information about the spread used"""
    spread_type: SpreadType
    name: str
    name_th: str
    card_count: int
    description: Optional[str] = None
    description_th: Optional[str] = None
    positions: List[str]
    positions_th: List[str]


class DrawCardsResponse(BaseModel):
    """Response from drawing cards"""
    reading_id: str = Field(..., description="Unique reading identifier")
    session_id: str = Field(..., description="Session identifier")
    spread: SpreadInfo
    cards: List[DrawnCard]
    question: str
    created_at: str = Field(..., description="ISO timestamp")


class GetReadingRequest(BaseModel):
    """Request to get a reading"""
    reading_id: str
    session_id: str


class ReadingResponse(BaseModel):
    """Response with full reading details"""
    reading_id: str
    session_id: str
    question: str
    spread: SpreadInfo
    cards: List[DrawnCard]
    interpretation: Optional[str] = None
    interpretation_th: Optional[str] = None
    status: str
    created_at: str
    completed_at: Optional[str] = None


# ============== US-003: Follow-up Questions ==============

class FollowUpRequest(BaseModel):
    """Request to create a follow-up question"""
    session_id: str = Field(
        ...,
        description="Session identifier"
    )
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="The follow-up question"
    )
    previous_reading_id: str = Field(
        ...,
        description="ID of the previous reading for context"
    )
    language: str = Field(
        default="th",
        description="Language code (th, en)"
    )


class FollowUpResponse(BaseModel):
    """Response from creating a follow-up"""
    follow_up_id: str = Field(..., description="Unique follow-up identifier")
    session_id: str = Field(..., description="Session identifier")
    previous_reading_id: str = Field(..., description="Previous reading ID")
    new_reading_id: Optional[str] = Field(None, description="New reading ID if created")
    question: str = Field(..., description="The follow-up question asked")
    response: str = Field(..., description="AI response to the follow-up")
    context_summary: str = Field(..., description="Summary of previous context")
    cards: Optional[List[DrawnCard]] = Field(None, description="New cards if drawn")
    follow_up_count: int = Field(..., description="Current follow-up count")
    remaining_follow_ups: int = Field(..., description="Remaining follow-ups allowed")
    max_follow_ups: int = Field(default=3, description="Maximum follow-ups allowed")
    created_at: str = Field(..., description="ISO timestamp")


class SessionHistoryRequest(BaseModel):
    """Request to get session history"""
    session_id: str = Field(..., description="Session identifier")


class Interaction(BaseModel):
    """An interaction in the session history"""
    id: str = Field(..., description="Interaction ID")
    interaction_type: str = Field(..., description="Type: 'initial' or 'follow_up'")
    question: str = Field(..., description="Question asked")
    question_category: Optional[str] = Field(None, description="Category of question")
    reading_id: Optional[str] = Field(None, description="Associated reading ID")
    sequence_number: int = Field(..., description="Order in session")
    context_summary: Optional[str] = Field(None, description="Context from previous")
    created_at: str = Field(..., description="ISO timestamp")


class SessionInfo(BaseModel):
    """Session information"""
    session_id: str = Field(..., description="Session identifier")
    status: str = Field(..., description="Session status: active, completed, expired")
    follow_up_count: int = Field(..., description="Number of follow-ups used")
    remaining_follow_ups: int = Field(..., description="Remaining follow-ups")
    max_follow_ups: int = Field(default=3, description="Maximum allowed")
    created_at: str = Field(..., description="Session creation time")
    last_interaction_at: str = Field(..., description="Last activity time")
    expires_at: str = Field(..., description="Session expiration time")
    is_expired: bool = Field(..., description="Whether session is expired")


class SessionHistoryResponse(BaseModel):
    """Response with session history"""
    session: SessionInfo
    interactions: List[Interaction]
