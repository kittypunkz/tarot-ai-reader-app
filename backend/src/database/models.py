"""
SQLAlchemy Database Models
US-001: Question Validation and Rate Limiting
"""

from sqlalchemy import Column, String, Text, Enum, Numeric, DateTime, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
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
