"""Message schemas for API requests and responses."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"


class MessageCreate(BaseModel):
    """Schema for creating a new message."""
    conversation_id: str
    role: MessageRole
    content: str = Field(min_length=1, max_length=10000)
    metadata: Optional[Dict[str, Any]] = None


class MessageRead(BaseModel):
    """Schema for reading message data."""
    id: str
    conversation_id: str
    role: MessageRole
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
