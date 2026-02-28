"""
Database connection and session management
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.database.models import Base

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tarot.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database - create tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session generator"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
