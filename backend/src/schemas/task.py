"""Pydantic schemas for Task API operations."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TaskBase(BaseModel):
    """Base schema for task operations."""
    title: str
    description: Optional[str] = None
    completed: bool = False
    user_id: str


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str
    description: Optional[str] = None
    completed: bool = False
    # user_id will be extracted from JWT, not from request body for security


class TaskRead(TaskBase):
    """Schema for reading a task."""
    id: int
    created_at: datetime
    updated_at: datetime


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskToggleComplete(BaseModel):
    """Schema for toggling task completion status."""
    completed: bool


class TokenData(BaseModel):
    """Schema for JWT token data."""
    user_id: Optional[str] = None
    email: Optional[str] = None