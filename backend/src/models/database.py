"""Database configuration and session management for Todo API."""

import os
from sqlmodel import SQLModel, create_engine
from sqlalchemy import event
from sqlalchemy.pool import Pool

# Import models to register them with SQLModel metadata
from .task import Task  # noqa: F401
from .user import User  # noqa: F401
from .conversation import Conversation  # noqa: F401
from .message import Message  # noqa: F401

# Get database URL from environment, with a default for testing
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# T046: Configure connection pooling for production databases
if "sqlite" in DATABASE_URL:
    # SQLite doesn't need connection pooling (single file database)
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL/Neon with connection pooling
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_size=10,              # Number of connections to maintain
        max_overflow=20,           # Additional connections when pool is full
        pool_timeout=30,           # Seconds to wait for connection
        pool_recycle=3600,         # Recycle connections after 1 hour
        pool_pre_ping=True         # Verify connections before using
    )

def create_db_and_tables():
    """Create database tables."""
    SQLModel.metadata.create_all(engine)

# Optional: Add connection pooling configuration
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Configure SQLite for testing purposes."""
    if "sqlite" in DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()