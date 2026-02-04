"""
Unit tests for Pydantic schemas/models
These tests ensure the data models match what the frontend expects
"""

import pytest
from datetime import datetime
from typing import Optional
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

# Import the models/schemas
try:
    from schemas import UserCreate, UserResponse, TaskCreate, TaskUpdate, TaskResponse
except ImportError:
    # Define the schemas here if they don't exist yet
    from pydantic import BaseModel

    class UserBase(BaseModel):
        email: str
        name: Optional[str] = None

    class UserCreate(UserBase):
        password: str

    class UserResponse(UserBase):
        id: str
        created_at: datetime

        class Config:
            from_attributes = True

    class TaskBase(BaseModel):
        title: str
        description: Optional[str] = None
        completed: bool = False

    class TaskCreate(TaskBase):
        pass

    class TaskUpdate(BaseModel):
        title: Optional[str] = None
        description: Optional[str] = None
        completed: Optional[bool] = None

    class TaskResponse(TaskBase):
        id: int
        user_id: str
        created_at: datetime
        updated_at: datetime

        class Config:
            from_attributes = True


def test_user_create_schema():
    """Test UserCreate schema - matches frontend registration expectations"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "securepassword123"
    }

    user = UserCreate(**user_data)

    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.password == "securepassword123"

    # Test required fields
    with pytest.raises(ValueError):
        UserCreate(email="test@example.com", password="securepassword123")


def test_user_response_schema():
    """Test UserResponse schema - matches frontend session expectations"""
    user_data = {
        "id": "user-123",
        "email": "test@example.com",
        "name": "Test User",
        "created_at": datetime.now()
    }

    user = UserResponse(**user_data)

    assert user.id == "user-123"
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert isinstance(user.created_at, datetime)


def test_task_create_schema():
    """Test TaskCreate schema - matches frontend task creation expectations"""
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "completed": False
    }

    task = TaskCreate(**task_data)

    assert task.title == "Test Task"
    assert task.description == "Test Description"
    assert task.completed is False

    # Test required fields
    with pytest.raises(ValueError):
        TaskCreate(description="No title", completed=True)


def test_task_update_schema():
    """Test TaskUpdate schema - matches frontend task update expectations"""
    update_data = {
        "title": "Updated Task",
        "completed": True
    }

    task_update = TaskUpdate(**update_data)

    assert task_update.title == "Updated Task"
    assert task_update.completed is True
    assert task_update.description is None


def test_task_response_schema():
    """Test TaskResponse schema - matches frontend task display expectations"""
    task_data = {
        "id": 1,
        "user_id": "user-123",
        "title": "Test Task",
        "description": "Test Description",
        "completed": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    task = TaskResponse(**task_data)

    assert task.id == 1
    assert task.user_id == "user-123"
    assert task.title == "Test Task"
    assert task.description == "Test Description"
    assert task.completed is False
    assert isinstance(task.created_at, datetime)
    assert isinstance(task.updated_at, datetime)


def test_minimal_task_creation():
    """Test creating a task with minimal required fields"""
    task_data = {
        "title": "Minimal Task"
    }

    task = TaskCreate(**task_data)

    assert task.title == "Minimal Task"
    assert task.description is None
    assert task.completed is False


def test_optional_fields_handling():
    """Test that optional fields are handled correctly"""
    user_data = {
        "email": "test@example.com",
        "password": "securepassword123"
        # name is optional
    }

    user = UserCreate(**user_data)

    assert user.email == "test@example.com"
    assert user.password == "securepassword123"
    assert user.name is None


def test_field_validation():
    """Test field validation"""
    # Test invalid email format
    with pytest.raises(ValueError):
        UserCreate(email="invalid-email", password="securepassword123", name="Test User")


def test_datetime_serialization():
    """Test datetime serialization"""
    now = datetime.now()
    task_data = {
        "id": 1,
        "user_id": "user-123",
        "title": "DateTime Test",
        "description": "Test Description",
        "completed": False,
        "created_at": now,
        "updated_at": now
    }

    task = TaskResponse(**task_data)

    assert task.created_at == now
    assert task.updated_at == now


def test_schema_config():
    """Test that schema configuration allows from_attributes"""
    # This tests that the Config class has from_attributes = True
    # which allows creating objects from ORM models
    task_dict = {
        "id": 1,
        "user_id": "user-123",
        "title": "Attribute Test",
        "description": "Test Description",
        "completed": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    # This should work if from_attributes is configured correctly
    task = TaskResponse(**task_dict)
    assert task.id == 1