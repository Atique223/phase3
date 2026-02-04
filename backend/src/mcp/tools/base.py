"""Base MCP tool class with user_id validation and error handling."""

from typing import Dict, Any, Optional
from sqlmodel import Session
from ...models.database import engine
import logging

logger = logging.getLogger(__name__)


class BaseMCPTool:
    """Base class for MCP tools with common functionality."""

    def __init__(self, name: str, description: str):
        """Initialize base MCP tool.

        Args:
            name: Tool name
            description: Tool description
        """
        self.name = name
        self.description = description

    def validate_user_id(self, user_id: str) -> bool:
        """Validate user_id format.

        Args:
            user_id: User ID to validate

        Returns:
            True if valid, False otherwise
        """
        if not user_id or not isinstance(user_id, str):
            return False
        # Basic validation - user_id should be non-empty string
        return len(user_id.strip()) > 0

    def handle_error(self, error: Exception, context: str) -> Dict[str, Any]:
        """Handle tool execution errors.

        Args:
            error: Exception that occurred
            context: Context description

        Returns:
            Error response dictionary
        """
        logger.error(f"MCP Tool Error in {context}: {str(error)}")
        return {
            "success": False,
            "error": str(error),
            "context": context
        }

    def success_response(self, data: Any) -> Dict[str, Any]:
        """Create success response.

        Args:
            data: Response data

        Returns:
            Success response dictionary
        """
        return {
            "success": True,
            "data": data
        }

    def get_session(self) -> Session:
        """Get database session.

        Returns:
            SQLModel Session
        """
        return Session(engine)
