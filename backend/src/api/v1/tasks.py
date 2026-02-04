"""Task API routes for Todo API with JWT Authentication."""

from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException, status

from ...models.database import engine
from ...models.task import Task as TaskModel, TaskCreate, TaskUpdate
from ...schemas.task import TaskRead, TaskCreate as TaskCreateSchema, TaskUpdate as TaskUpdateSchema, TaskToggleComplete
from ...auth.deps import get_current_user, get_user_id_from_token
from ...auth.jwt_utils import validate_user_access


router = APIRouter()


@router.get("/users/{user_id}/tasks", response_model=List[TaskRead], tags=["tasks"])
async def get_tasks(
    user_id: str,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Retrieve all tasks for the specified user.

    Args:
        user_id: The ID of the user whose tasks to retrieve
        current_user_id: The ID of the authenticated user (from JWT)

    Returns:
        List of tasks for the specified user

    Raises:
        HTTPException: If user_id in JWT doesn't match path user_id
    """
    # Validate that the user in JWT matches the requested user_id
    if not validate_user_access(current_user_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only access your own tasks"
        )

    # Query the database for tasks belonging to the user
    with Session(engine) as session:
        statement = select(TaskModel).where(TaskModel.user_id == user_id)
        tasks = session.exec(statement).all()
        return tasks


@router.post("/users/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED, tags=["tasks"])
async def create_task(
    user_id: str,
    task_create: TaskCreateSchema,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Create a new task for the specified user.

    Args:
        user_id: The ID of the user to create the task for
        task_create: Task creation data
        current_user_id: The ID of the authenticated user (from JWT)

    Returns:
        The created task

    Raises:
        HTTPException: If user_id in JWT doesn't match path user_id
    """
    # Validate that the user in JWT matches the requested user_id
    if not validate_user_access(current_user_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only create tasks for yourself"
        )

    # Create the task in the database
    task = TaskModel(**task_create.model_dump())
    task.user_id = user_id  # Ensure the task is linked to the correct user

    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task


@router.get("/users/{user_id}/tasks/{task_id}", response_model=TaskRead, tags=["tasks"])
async def get_task(
    user_id: str,
    task_id: int,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Retrieve a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to retrieve
        current_user_id: The ID of the authenticated user (from JWT)

    Returns:
        The requested task

    Raises:
        HTTPException: If user_id in JWT doesn't match path user_id or task not found
    """
    # Validate that the user in JWT matches the requested user_id
    if not validate_user_access(current_user_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only access your own tasks"
        )

    # Query the database for the specific task
    with Session(engine) as session:
        statement = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == user_id)
        task = session.exec(statement).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return task


@router.put("/users/{user_id}/tasks/{task_id}", response_model=TaskRead, tags=["tasks"])
async def update_task(
    user_id: str,
    task_id: int,
    task_update: TaskUpdateSchema,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Update a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to update
        task_update: Task update data
        current_user_id: The ID of the authenticated user (from JWT)

    Returns:
        The updated task

    Raises:
        HTTPException: If user_id in JWT doesn't match path user_id or task not found
    """
    # Validate that the user in JWT matches the requested user_id
    if not validate_user_access(current_user_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only update your own tasks"
        )

    # Query the database for the specific task
    with Session(engine) as session:
        statement = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == user_id)
        task = session.exec(statement).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Update task fields
        for field, value in task_update.dict(exclude_unset=True).items():
            setattr(task, field, value)

        # Update the updated_at timestamp
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)
        return task


@router.delete("/users/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["tasks"])
async def delete_task(
    user_id: str,
    task_id: int,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Delete a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to delete
        current_user_id: The ID of the authenticated user (from JWT)

    Raises:
        HTTPException: If user_id in JWT doesn't match path user_id or task not found
    """
    # Validate that the user in JWT matches the requested user_id
    if not validate_user_access(current_user_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only delete your own tasks"
        )

    # Query the database for the specific task
    with Session(engine) as session:
        statement = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == user_id)
        task = session.exec(statement).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        session.delete(task)
        session.commit()


@router.patch("/users/{user_id}/tasks/{task_id}/complete", response_model=TaskRead, tags=["tasks"])
async def toggle_task_completion(
    user_id: str,
    task_id: int,
    task_toggle: TaskToggleComplete,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Toggle the completion status of a specific task by ID for the specified user.

    Args:
        user_id: The ID of the user who owns the task
        task_id: The ID of the task to update
        task_toggle: Task completion toggle data
        current_user_id: The ID of the authenticated user (from JWT)

    Returns:
        The updated task with new completion status

    Raises:
        HTTPException: If user_id in JWT doesn't match path user_id or task not found
    """
    # Validate that the user in JWT matches the requested user_id
    if not validate_user_access(current_user_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only update your own tasks"
        )

    # Query the database for the specific task
    with Session(engine) as session:
        statement = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == user_id)
        task = session.exec(statement).first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Update completion status
        task.completed = task_toggle.completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)
        return task