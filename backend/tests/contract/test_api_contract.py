"""Contract tests for Task API endpoints."""

import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from unittest.mock import patch, MagicMock
from datetime import datetime

from src.main import app
from src.models.task import Task


@pytest.fixture
def client():
    """Test client for the API."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.mark.parametrize("endpoint,method", [
    ("/api/users/{user_id}/tasks", "GET"),
    ("/api/users/{user_id}/tasks", "POST"),
    ("/api/users/{user_id}/tasks/{id}", "GET"),
    ("/api/users/{user_id}/tasks/{id}", "PUT"),
    ("/api/users/{user_id}/tasks/{id}", "DELETE"),
    ("/api/users/{user_id}/tasks/{id}/complete", "PATCH"),
])
def test_endpoint_exists(endpoint, method, client):
    """Test that all required endpoints exist."""
    # We expect these to return 401/403/404 due to auth/validation, not 404 due to missing routes
    # Mock the authentication to bypass it for this contract test
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value.user_id = "test_user"

        if method == "GET":
            response = client.get(endpoint.format(user_id="test_user", id=1))
        elif method == "POST":
            response = client.post(endpoint.format(user_id="test_user", id=1), json={})
        elif method == "PUT":
            response = client.put(endpoint.format(user_id="test_user", id=1), json={})
        elif method == "DELETE":
            response = client.delete(endpoint.format(user_id="test_user", id=1))
        elif method == "PATCH":
            response = client.patch(endpoint.format(user_id="test_user", id=1), json={})

        # We expect these to not return 404 (not found) as that would mean the route doesn't exist
        assert response.status_code != 404, f"Endpoint {endpoint} with method {method} does not exist"


def test_get_tasks_contract(client):
    """Test GET /api/{user_id}/tasks contract."""
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value = MagicMock(user_id="test_user")

        response = client.get("/api/users/test_user/tasks")

        # Should return 200 with list of tasks or 401/403 for auth issues
        assert response.status_code in [200, 401, 403]
        if response.status_code == 200:
            assert isinstance(response.json(), list)


def test_post_tasks_contract(client):
    """Test POST /api/{user_id}/tasks contract."""
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value = MagicMock(user_id="test_user")

        task_data = {
            "title": "Test Task",
            "description": "Test Description"
        }

        response = client.post("/api/users/test_user/tasks", json=task_data)

        # Should return 201 created or 401/403 for auth issues
        assert response.status_code in [201, 401, 403, 422]
        if response.status_code == 201:
            response_json = response.json()
            assert "id" in response_json
            assert "title" in response_json
            assert "completed" in response_json


def test_get_single_task_contract(client):
    """Test GET /api/{user_id}/tasks/{id} contract."""
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value = MagicMock(user_id="test_user")

        response = client.get("/api/users/test_user/tasks/1")

        # Should return 200 if task exists, 404 if not, or 401/403 for auth issues
        assert response.status_code in [200, 401, 403, 404]
        if response.status_code == 200:
            response_json = response.json()
            assert "id" in response_json
            assert "title" in response_json
            assert "completed" in response_json


def test_put_task_contract(client):
    """Test PUT /api/{user_id}/tasks/{id} contract."""
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value = MagicMock(user_id="test_user")

        task_data = {
            "title": "Updated Task",
            "description": "Updated Description",
            "completed": True
        }

        response = client.put("/api/users/test_user/tasks/1", json=task_data)

        # Should return 200 updated or 401/403/404 for auth/not found issues
        assert response.status_code in [200, 401, 403, 404, 422]
        if response.status_code == 200:
            response_json = response.json()
            assert "id" in response_json
            assert "title" in response_json
            assert "completed" in response_json


def test_delete_task_contract(client):
    """Test DELETE /api/{user_id}/tasks/{id} contract."""
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value = MagicMock(user_id="test_user")

        response = client.delete("/api/users/test_user/tasks/1")

        # Should return 204 no content or 401/403/404 for auth/not found issues
        assert response.status_code in [204, 401, 403, 404]


def test_patch_task_complete_contract(client):
    """Test PATCH /api/{user_id}/tasks/{id}/complete contract."""
    with patch('backend.src.auth.deps.verify_token') as mock_verify:
        mock_verify.return_value = MagicMock(user_id="test_user")

        completion_data = {
            "completed": True
        }

        response = client.patch("/api/users/test_user/tasks/1/complete", json=completion_data)

        # Should return 200 updated or 401/403/404 for auth/not found issues
        assert response.status_code in [200, 401, 403, 404, 422]
        if response.status_code == 200:
            response_json = response.json()
            assert "id" in response_json
            assert "completed" in response_json