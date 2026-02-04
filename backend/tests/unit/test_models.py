"""Unit tests for models in Todo API."""

import pytest
from datetime import datetime
from sqlmodel import Session

from src.models.task import Task, TaskCreate, TaskUpdate


def test_task_creation():
    """Test creating a new task."""
    task = Task(
        title="Test Task",
        description="Test Description",
        completed=False,
        user_id="user123",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    assert task.title == "Test Task"
    assert task.description == "Test Description"
    assert task.completed is False
    assert task.user_id == "user123"
    assert task.id is None  # ID will be assigned by the database


def test_task_create_schema():
    """Test TaskCreate schema."""
    task_create = TaskCreate(
        title="Test Task",
        description="Test Description",
        completed=False,
        user_id="user123"
    )

    assert task_create.title == "Test Task"
    assert task_create.description == "Test Description"
    assert task_create.completed is False
    assert task_create.user_id == "user123"


def test_task_update_schema():
    """Test TaskUpdate schema."""
    task_update = TaskUpdate(
        title="Updated Task",
        description="Updated Description",
        completed=True
    )

    assert task_update.title == "Updated Task"
    assert task_update.description == "Updated Description"
    assert task_update.completed is True


def test_task_update_partial():
    """Test TaskUpdate schema with partial updates."""
    task_update = TaskUpdate(title="Updated Title")

    assert task_update.title == "Updated Title"
    # Other fields should be None since they weren't provided
    assert task_update.description is None
    assert task_update.completed is None


def test_task_title_validation():
    """Test that Task validates title length."""
    # This test assumes the model has validation
    task = Task(
        title="A" * 255,  # Maximum length
        description="Test Description",
        completed=False,
        user_id="user123",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    assert len(task.title) == 255


def test_task_empty_title_fails():
    """Test that empty title fails validation."""
    with pytest.raises(ValueError):
        Task(
            title="",  # Empty title should fail validation
            description="Test Description",
            completed=False,
            user_id="user123",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )


def test_task_long_title_fails():
    """Test that overly long title fails validation."""
    with pytest.raises(ValueError):
        Task(
            title="A" * 256,  # Too long title should fail validation
            description="Test Description",
            completed=False,
            user_id="user123",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )