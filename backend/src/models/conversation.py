"""Conversation model for AI chat sessions."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
import uuid


class Conversation(SQLModel, table=True):
    """Conversation model for chat sessions between user and AI agent."""

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        nullable=False
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )
