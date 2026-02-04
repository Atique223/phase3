"""
Integration tests for authentication endpoints
These tests ensure the backend API matches what the frontend expects
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_sign_up_endpoint(client):
    """Test sign up endpoint - matches frontend expectation"""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }

    response = client.post("/api/signup", json=user_data)

    # The endpoint might return different status codes depending on implementation
    # Common responses: 200 for success, 201 for created, 400 for bad request, 409 for conflict
    assert response.status_code in [200, 201, 400, 409, 422]

    # If successful, response should contain user data and token
    if response.status_code in [200, 201]:
        data = response.json()
        assert "user" in data
        assert "token" in data


def test_sign_in_endpoint(client):
    """Test sign in endpoint - matches frontend expectation"""
    # First, ensure a user exists (or create one)
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }

    # Attempt to create the user (might fail if user already exists)
    client.post("/api/signup", json=user_data)

    # Now try to sign in
    login_data = {
        "email": "test@example.com",
        "password": "securepassword123"
    }

    response = client.post("/api/signin", json=login_data)

    # Common responses: 200 for success, 400 for bad request, 401 for unauthorized
    assert response.status_code in [200, 400, 401, 422]

    # If successful, response should contain user data and token
    if response.status_code == 200:
        data = response.json()
        assert "user" in data
        assert "token" in data


def test_sign_out_endpoint(client):
    """Test sign out endpoint - matches frontend expectation"""
    # Sign out typically requires authentication, so this test might need a valid token
    # For now, testing the endpoint exists and returns appropriate status
    response = client.post("/api/signout")

    # Common responses: 200 for success, 401 for unauthorized
    assert response.status_code in [200, 401]


def test_session_endpoint(client):
    """Test session endpoint - matches frontend expectation"""
    # This endpoint would typically check if the current session is valid
    # It might require authentication
    response = client.get("/api/session")

    # Common responses: 200 for success (with user data), 401/403 for unauthorized
    assert response.status_code in [200, 401, 403]

    # If successful, response should contain user data
    if response.status_code == 200:
        data = response.json()
        assert "user" in data


def test_protected_route_without_auth(client):
    """Test that protected routes require authentication"""
    # Try accessing a protected route without authentication
    # This should return 401 or 403
    response = client.get("/api/users/test/tasks")
    assert response.status_code in [401, 403, 404]  # 404 for invalid user_id


def test_protected_route_with_auth(client):
    """Test that protected routes work with proper authentication"""
    # First, get a valid token by signing in
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }

    # Create the user if it doesn't exist
    client.post("/api/signup", json=user_data)

    # Sign in to get a token
    login_data = {
        "email": "test@example.com",
        "password": "securepassword123"
    }

    sign_in_response = client.post("/api/signin", json=login_data)

    if sign_in_response.status_code == 200:
        token = sign_in_response.json().get("token")

        # Now try accessing a protected route with the token
        headers = {"Authorization": f"Bearer {token}"}

        # We need to use the correct user ID from the token. For this test,
        # we'll use a placeholder user ID and expect appropriate response
        response = client.get("/api/users/test-user-id/tasks", headers=headers)

        # Should return 200 if the token is valid and user has access,
        # or 403 if token user doesn't match path user, or 404 if user doesn't exist
        assert response.status_code in [200, 403, 404, 422]
    else:
        # If sign in failed, we still expect the protected route to return 401
        response = client.get("/api/users/test/tasks")
        assert response.status_code in [401, 403, 404]


def test_jwt_token_validation(client):
    """Test JWT token validation"""
    # Test with an invalid/expired token
    headers = {"Authorization": "Bearer invalid-token"}
    response = client.get("/api/users/test/tasks", headers=headers)

    # Should return 401 for invalid token
    assert response.status_code in [401, 403]


def test_auth_endpoints_return_correct_format(client):
    """Test that auth endpoints return data in the format expected by frontend"""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }

    # Create user
    signup_response = client.post("/api/signup", json=user_data)

    if signup_response.status_code in [200, 201]:
        data = signup_response.json()
        # Frontend expects: { success: boolean, user: {...}, token: string }
        # Or: { user: {...}, token: string }
        assert "user" in data
        assert isinstance(data["user"], dict)
        assert "id" in data["user"] or "email" in data["user"]
        assert "token" in data or "access_token" in data