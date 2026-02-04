"""Message model for conversation messages."""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import Field, SQLModel, Column, JSON
from enum import Enum
import uuid


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    """Message model for conversation messages."""

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )
    conversation_id: str = Field(
        foreign_key="conversation.id",
        index=True,
        nullable=False
    )
    role: MessageRole = Field(
        nullable=False,
        index=True
    )
    content: str = Field(
        nullable=False,
        max_length=10000
    )
    message_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )
