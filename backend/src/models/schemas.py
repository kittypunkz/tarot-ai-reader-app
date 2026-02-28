"""
Pydantic schemas for API requests/responses
US-001: AI Gatekeeper
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
        description="User's question to validate"
    )
    session_id: Optional[str] = Field(
        None,
        description="Session identifier for tracking"
    )
    language: str = Field(
        default="th",
        description="Language code (th, en)"
    )
    
    @validator('question')
    def sanitize_question(cls, v):
        """Sanitize question - remove HTML tags, excessive whitespace"""
        import re
        # Remove HTML tags
        v = re.sub(r'<[^>]+>', '', v)
        # Normalize whitespace
        v = ' '.join(v.split())
        return v.strip()


class ValidateQuestionResponse(BaseModel):
    """Response from question validation"""
    status: ValidationStatus
    confidence: float = Field(..., ge=0.0, le=1.0)
    category: Optional[QuestionCategory] = None
    question_type: Optional[QuestionType] = None
    suggested_spread: int = Field(default=1, ge=1, le=10)
    # Rejection/clarification fields
    reason: Optional[RejectionReason] = None
    message: Optional[str] = None
    suggestion: Optional[str] = None
    examples: Optional[List[str]] = None


class RateLimitInfo(BaseModel):
    """Rate limit information"""
    allowed: bool
    remaining: int
    reset_after: int
    limit: int
