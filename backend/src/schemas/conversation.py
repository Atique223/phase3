"""Conversation schemas for API requests and responses."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ConversationCreate(BaseModel):
    """Schema for creating a new conversation."""
    user_id: str


class ConversationRead(BaseModel):
    """Schema for reading conversation data."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
