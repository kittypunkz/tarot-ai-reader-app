"""
SQLAlchemy Database Models
US-001: Question Validation and Rate Limiting
US-002: Intelligent Spread Selection
"""

from sqlalchemy import Column, String, Text, Numeric, DateTime, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()


class QuestionValidation(Base):
    """Log of question validations"""
    __tablename__ = "question_validations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(50), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    status = Column(String(20), nullable=False)  # approved, rejected, clarification_needed
    rejection_reason = Column(String(50), nullable=True)
    confidence_score = Column(Numeric(3, 2), nullable=True)
    detected_category = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class RateLimit(Base):
    """Rate limiting tracking"""
    __tablename__ = "rate_limits"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip_address = Column(String(45), nullable=False, index=True)
    session_id = Column(String(50), nullable=True, index=True)
    request_count = Column(Integer, default=0)
    window_start = Column(DateTime, nullable=False)
    last_request = Column(DateTime, nullable=False, server_default=func.now())


class Session(Base):
    """User sessions"""
    __tablename__ = "sessions"
    
    id = Column(String(50), primary_key=True)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    last_activity = Column(DateTime, server_default=func.now(), onupdate=func.now())
    follow_up_count = Column(Integer, default=0)
    status = Column(String(20), default="active")  # active, completed, expired


# ============== US-002: Spread Selection Models ==============

class Spread(Base):
    """Tarot spread definitions"""
    __tablename__ = "spreads"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False, unique=True)  # e.g., 'single', 'three_ppf'
    name_th = Column(String(100), nullable=False)  # Thai name
    card_count = Column(Integer, nullable=False)  # Number of cards in spread
    description = Column(Text, nullable=True)
    description_th = Column(Text, nullable=True)
    positions = Column(JSON, nullable=False)  # Array of position names ["Past", "Present", "Future"]
    positions_th = Column(JSON, nullable=False)  # Thai position names
    is_premium = Column(Boolean, default=False)  # Premium feature flag
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationship
    readings = relationship("Reading", back_populates="spread")


class Reading(Base):
    """A tarot reading session (group of drawn cards)"""
    __tablename__ = "readings"
    
    id = Column(String(50), primary_key=True)  # read_xxx
    session_id = Column(String(50), ForeignKey("sessions.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)  # Original question
    spread_id = Column(String(36), ForeignKey("spreads.id"), nullable=False)
    spread_type = Column(String(50), nullable=False)  # Denormalized for quick access
    status = Column(String(20), default="in_progress")  # in_progress, completed
    interpretation = Column(Text, nullable=True)  # AI interpretation
    interpretation_th = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    spread = relationship("Spread", back_populates="readings")
    cards = relationship("CardDraw", back_populates="reading", order_by="CardDraw.position")


class CardDraw(Base):
    """Individual card drawn in a reading"""
    __tablename__ = "card_draws"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reading_id = Column(String(50), ForeignKey("readings.id"), nullable=False, index=True)
    session_id = Column(String(50), ForeignKey("sessions.id"), nullable=False, index=True)
    card_id = Column(String(50), nullable=False)  # Reference to tarot card
    card_name = Column(String(100), nullable=False)  # Denormalized
    card_name_th = Column(String(100), nullable=False)
    position = Column(Integer, nullable=False)  # Position in spread (0, 1, 2...)
    position_name = Column(String(50), nullable=True)  # e.g., "Past", "Present"
    orientation = Column(String(20), nullable=False, default="upright")  # upright, reversed
    meaning_context = Column(Text, nullable=True)  # Card meaning in this position
    meaning_context_th = Column(Text, nullable=True)
    drawn_at = Column(DateTime, server_default=func.now())
    
    # Relationship
    reading = relationship("Reading", back_populates="cards")
    
    # Indexes
    __table_args__ = (
        # Ensure unique position per reading
        {'sqlite_autoincrement': True},
    )


# ============== US-003: Follow-up Interactions ==============

class Interaction(Base):
    """Session interactions (initial + follow-ups)"""
    __tablename__ = "interactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(50), ForeignKey("sessions.id"), nullable=False, index=True)
    interaction_type = Column(String(20), nullable=False)  # 'initial', 'follow_up'
    question = Column(Text, nullable=False)
    question_category = Column(String(50), nullable=True)  # career, love, health, etc.
    reading_id = Column(String(50), ForeignKey("readings.id"), nullable=True)
    sequence_number = Column(Integer, nullable=False)  # 0, 1, 2, 3...
    context_summary = Column(Text, nullable=True)  # AI summary for context
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    session = relationship("Session", backref="interactions")
    reading = relationship("Reading", backref="interaction")
    
    # Indexes
    __table_args__ = (
        # Ensure unique sequence per session
        {'sqlite_autoincrement': True},
    )
