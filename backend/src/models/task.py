"""Task model definition for Todo API."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
import re


class TaskBase(SQLModel):
    """Base class for Task model with common fields."""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    user_id: str = Field(sa_column_kwargs={"index": True})  # Index for efficient filtering by user


class Task(TaskBase, table=True):
    """Task model for the database table."""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def __setattr__(self, name, value):
        """Override to add validation for sensitive fields."""
        if name == "user_id":
            # Validate user_id format to prevent injection
            if not re.match(r'^[a-zA-Z0-9_-]+$', str(value)):
                raise ValueError("Invalid user_id format")
        super().__setattr__(name, value)


class TaskUpdate(SQLModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass  # Inherits all fields from TaskBase