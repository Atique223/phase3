"""
Pytest configuration and fixtures for backend tests
This file contains shared fixtures and configuration for all backend tests
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.main import app
from src.models.database import engine
from src.models.user import User
from src.models.task import Task
from src.auth.deps import get_current_user


# Use the existing engine from database module
from sqlmodel import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create a separate test engine to avoid conflicts
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})

def override_get_db():
    with Session(test_engine) as session:
        yield session


def override_get_current_user():
    # Mock user for testing
    return {"id": "test-user-id", "email": "test@example.com"}


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    # Override database dependency only
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    # Clean up
    app.dependency_overrides.clear()

@pytest.fixture
def db():
    """Create a test database session"""
    database = TestingSessionLocal()
    try:
        yield database
    finally:
        database.close()


@pytest.fixture
def mock_user():
    """Mock user data for testing"""
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "name": "Test User"
    }


@pytest.fixture
def mock_task():
    """Mock task data for testing"""
    return {
        "id": 1,
        "user_id": "test-user-id",
        "title": "Test Task",
        "description": "Test Description",
        "completed": False
    }


@pytest.fixture
def auth_headers():
    """Headers with mock JWT token for authenticated requests"""
    return {
        "Authorization": "Bearer mock-jwt-token",
        "Content-Type": "application/json"
    }


@pytest.fixture
def sample_user_data():
    """Sample user data for creating test users"""
    return {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }


@pytest.fixture
def sample_task_data():
    """Sample task data for creating test tasks"""
    return {
        "title": "Test Task",
        "description": "Test Description",
        "completed": False
    }


@pytest.fixture
def setup_test_data(db, mock_user, mock_task):
    """Set up test data in the database"""
    # Create a test user
    user = User(
        id=mock_user["id"],
        email=mock_user["email"],
        name=mock_user["name"]
    )
    db.add(user)

    # Create a test task
    task = Task(
        id=mock_task["id"],
        user_id=mock_user["id"],
        title=mock_task["title"],
        description=mock_task["description"],
        completed=mock_task["completed"]
    )
    db.add(task)

    db.commit()

    yield {"user": user, "task": task}

    # Cleanup
    db.delete(task)
    db.delete(user)
    db.commit()


def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "contract: mark test as contract test"
    )


@pytest.fixture(autouse=True)
def setup_and_teardown():
    """
    Setup and teardown for each test
    This runs automatically for every test
    """
    # Setup code (runs before each test)
    yield  # This is where the test runs
    # Teardown code (runs after each test)
    # Any cleanup code can go here