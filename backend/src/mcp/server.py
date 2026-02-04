"""MCP server initialization and tool registration."""

from typing import List, Dict, Any
import logging
from .tools.task_tools import (
    create_task_tool,
    list_tasks_tool,
    get_task_tool,
    update_task_tool,
    delete_task_tool
)

logger = logging.getLogger(__name__)


class MCPServer:
    """MCP server for managing and executing tools."""

    def __init__(self):
        """Initialize MCP server."""
        self.tools: Dict[str, Any] = {}
        self._register_tools()

    def _register_tools(self):
        """Register all MCP tools."""
        tools = [
            create_task_tool,
            list_tasks_tool,
            get_task_tool,
            update_task_tool,
            delete_task_tool
        ]

        for tool in tools:
            self.tools[tool.name] = tool
            logger.info(f"Registered MCP tool: {tool.name}")

    def get_tool(self, tool_name: str) -> Any:
        """Get a tool by name.

        Args:
            tool_name: Name of the tool

        Returns:
            Tool instance or None if not found
        """
        return self.tools.get(tool_name)

    def list_tools(self) -> List[Dict[str, str]]:
        """List all available tools.

        Returns:
            List of tool information dictionaries
        """
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools.values()
        ]

    def execute_tool(self, tool_name: str, user_id: str, **kwargs) -> Dict[str, Any]:
        """Execute a tool by name.

        Args:
            tool_name: Name of the tool to execute
            user_id: User ID for scoping
            **kwargs: Tool-specific parameters

        Returns:
            Tool execution result
        """
        tool = self.get_tool(tool_name)
        if not tool:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found"
            }

        try:
            return tool.execute(user_id=user_id, **kwargs)
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }


# Global MCP server instance
mcp_server = MCPServer()
