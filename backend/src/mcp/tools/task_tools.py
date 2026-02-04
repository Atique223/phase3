"""MCP tools for task operations."""

from typing import Dict, Any, Optional, List
from sqlmodel import Session, select
from .base import BaseMCPTool
from ...models.task import Task
from ...models.database import engine
import logging

logger = logging.getLogger(__name__)


class CreateTaskTool(BaseMCPTool):
    """MCP tool for creating tasks."""

    def __init__(self):
        super().__init__(
            name="create_task",
            description="Create a new task for the user"
        )

    def execute(self, user_id: str, title: str, description: Optional[str] = None) -> Dict[str, Any]:
        """Create a new task.

        Args:
            user_id: User ID
            title: Task title
            description: Optional task description

        Returns:
            Success response with task data or error response
        """
        if not self.validate_user_id(user_id):
            return self.handle_error(ValueError("Invalid user_id"), "create_task")

        try:
            with self.get_session() as session:
                task = Task(
                    user_id=user_id,
                    title=title,
                    description=description,
                    completed=False
                )
                session.add(task)
                session.commit()
                session.refresh(task)

                return self.success_response({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "user_id": task.user_id,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                })
        except Exception as e:
            return self.handle_error(e, "create_task")


class ListTasksTool(BaseMCPTool):
    """MCP tool for listing tasks."""

    def __init__(self):
        super().__init__(
            name="list_tasks",
            description="List all tasks for the user"
        )

    def execute(self, user_id: str, completed: Optional[bool] = None) -> Dict[str, Any]:
        """List tasks for a user.

        Args:
            user_id: User ID
            completed: Optional filter by completion status

        Returns:
            Success response with list of tasks or error response
        """
        if not self.validate_user_id(user_id):
            return self.handle_error(ValueError("Invalid user_id"), "list_tasks")

        try:
            with self.get_session() as session:
                statement = select(Task).where(Task.user_id == user_id)

                if completed is not None:
                    statement = statement.where(Task.completed == completed)

                tasks = session.exec(statement).all()

                task_list = [
                    {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "user_id": task.user_id,
                        "created_at": task.created_at.isoformat(),
                        "updated_at": task.updated_at.isoformat()
                    }
                    for task in tasks
                ]

                return self.success_response(task_list)
        except Exception as e:
            return self.handle_error(e, "list_tasks")


class GetTaskTool(BaseMCPTool):
    """MCP tool for getting a specific task."""

    def __init__(self):
        super().__init__(
            name="get_task",
            description="Get a specific task by ID"
        )

    def execute(self, user_id: str, task_id: int) -> Dict[str, Any]:
        """Get a specific task.

        Args:
            user_id: User ID
            task_id: Task ID

        Returns:
            Success response with task data or error response
        """
        if not self.validate_user_id(user_id):
            return self.handle_error(ValueError("Invalid user_id"), "get_task")

        try:
            with self.get_session() as session:
                statement = select(Task).where(
                    Task.id == task_id,
                    Task.user_id == user_id
                )
                task = session.exec(statement).first()

                if not task:
                    return self.handle_error(
                        ValueError(f"Task {task_id} not found"),
                        "get_task"
                    )

                return self.success_response({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "user_id": task.user_id,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                })
        except Exception as e:
            return self.handle_error(e, "get_task")


class UpdateTaskTool(BaseMCPTool):
    """MCP tool for updating tasks."""

    def __init__(self):
        super().__init__(
            name="update_task",
            description="Update a task"
        )

    def execute(self, user_id: str, task_id: int, **updates) -> Dict[str, Any]:
        """Update a task.

        Args:
            user_id: User ID
            task_id: Task ID
            **updates: Fields to update (title, description, completed)

        Returns:
            Success response with updated task data or error response
        """
        if not self.validate_user_id(user_id):
            return self.handle_error(ValueError("Invalid user_id"), "update_task")

        try:
            with self.get_session() as session:
                statement = select(Task).where(
                    Task.id == task_id,
                    Task.user_id == user_id
                )
                task = session.exec(statement).first()

                if not task:
                    return self.handle_error(
                        ValueError(f"Task {task_id} not found"),
                        "update_task"
                    )

                # Update allowed fields
                for field, value in updates.items():
                    if field in ["title", "description", "completed"]:
                        setattr(task, field, value)

                from datetime import datetime
                task.updated_at = datetime.utcnow()

                session.add(task)
                session.commit()
                session.refresh(task)

                return self.success_response({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "user_id": task.user_id,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                })
        except Exception as e:
            return self.handle_error(e, "update_task")


class DeleteTaskTool(BaseMCPTool):
    """MCP tool for deleting tasks."""

    def __init__(self):
        super().__init__(
            name="delete_task",
            description="Delete a task"
        )

    def execute(self, user_id: str, task_id: int) -> Dict[str, Any]:
        """Delete a task.

        Args:
            user_id: User ID
            task_id: Task ID

        Returns:
            Success response or error response
        """
        if not self.validate_user_id(user_id):
            return self.handle_error(ValueError("Invalid user_id"), "delete_task")

        try:
            with self.get_session() as session:
                statement = select(Task).where(
                    Task.id == task_id,
                    Task.user_id == user_id
                )
                task = session.exec(statement).first()

                if not task:
                    return self.handle_error(
                        ValueError(f"Task {task_id} not found"),
                        "delete_task"
                    )

                session.delete(task)
                session.commit()

                return self.success_response({"deleted": True, "task_id": task_id})
        except Exception as e:
            return self.handle_error(e, "delete_task")


# Tool instances
create_task_tool = CreateTaskTool()
list_tasks_tool = ListTasksTool()
get_task_tool = GetTaskTool()
update_task_tool = UpdateTaskTool()
delete_task_tool = DeleteTaskTool()
