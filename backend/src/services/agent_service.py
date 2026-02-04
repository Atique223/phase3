"""Agent service for OpenAI agent initialization and execution."""

from typing import List, Dict, Any, Optional
import os
import logging
from openai import OpenAI
from ..config.settings import settings
from ..models.message import Message, MessageRole
from ..mcp.server import mcp_server

logger = logging.getLogger(__name__)


def initialize_agent(user_id: str) -> Dict[str, Any]:
    """Initialize OpenAI agent with MCP tools.

    Args:
        user_id: User ID for context

    Returns:
        Agent configuration dictionary
    """
    try:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")

        # Get available tools from MCP server
        available_tools = mcp_server.list_tools()

        # Create agent configuration
        agent_config = {
            "user_id": user_id,
            "model": settings.OPENAI_MODEL,
            "tools": available_tools,
            "instructions": f"""You are a helpful todo management assistant for user {user_id}.

Your role is to help users manage their tasks through natural language conversation.

Available tools:
- create_task: Create a new task with a title and optional description
- list_tasks: List all tasks or filter by completion status
- get_task: Get details of a specific task by ID
- update_task: Update task title, description, or completion status
- delete_task: Delete a task by ID

Guidelines:
1. Always confirm actions taken (e.g., "I've created the task 'buy groceries'")
2. Be conversational and friendly
3. Ask clarifying questions if user intent is unclear
4. Use tools to perform all task operations - never invent or assume data
5. Provide helpful summaries when listing tasks
6. Handle errors gracefully with user-friendly messages

Remember: You can only access and modify tasks for user {user_id}."""
        }

        logger.info(f"Initialized agent for user {user_id}")
        return agent_config

    except Exception as e:
        logger.error(f"Error initializing agent: {str(e)}")
        raise


def execute_agent(
    user_id: str,
    message: str,
    conversation_history: List[Message]
) -> Dict[str, Any]:
    """Execute agent with message and conversation history.

    Args:
        user_id: User ID
        message: User message
        conversation_history: List of previous messages

    Returns:
        Agent response dictionary with content and metadata
    """
    try:
        # T045: Comprehensive logging - Start of agent execution
        logger.info(f"Starting agent execution for user {user_id}, message length: {len(message)}, history size: {len(conversation_history)}")

        # Initialize OpenAI client
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # Get agent configuration
        agent_config = initialize_agent(user_id)
        logger.debug(f"Agent initialized with model: {agent_config['model']}, tools: {len(agent_config['tools'])}")

        # Build message history for OpenAI
        messages = []

        # Add system message
        messages.append({
            "role": "system",
            "content": agent_config["instructions"]
        })

        # Add conversation history
        for msg in conversation_history:
            messages.append({
                "role": msg.role.value,
                "content": msg.content
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": message
        })

        # Define tool functions for OpenAI
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "create_task",
                    "description": "Create a new task for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Task title"
                            },
                            "description": {
                                "type": "string",
                                "description": "Optional task description"
                            }
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List all tasks for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "completed": {
                                "type": "boolean",
                                "description": "Filter by completion status (optional)"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_task",
                    "description": "Get a specific task by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "Task ID"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "Task ID"
                            },
                            "title": {
                                "type": "string",
                                "description": "New task title (optional)"
                            },
                            "description": {
                                "type": "string",
                                "description": "New task description (optional)"
                            },
                            "completed": {
                                "type": "boolean",
                                "description": "New completion status (optional)"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "Task ID"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]

        # Call OpenAI API
        import time
        start_time = time.time()

        # T045: Log API call
        logger.debug(f"Calling OpenAI API with {len(messages)} messages")

        response = client.chat.completions.create(
            model=agent_config["model"],
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        processing_time_ms = int((time.time() - start_time) * 1000)
        logger.info(f"OpenAI API responded in {processing_time_ms}ms")

        # Handle tool calls if present
        tool_calls_made = []
        assistant_message = response.choices[0].message

        if assistant_message.tool_calls:
            logger.info(f"Agent requested {len(assistant_message.tool_calls)} tool call(s)")
            # Execute tool calls
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                tool_calls_made.append(tool_name)

                import json
                tool_args = json.loads(tool_call.function.arguments)

                # T040: Log tool selection
                logger.info(f"Agent selected tool '{tool_name}' for user {user_id} with args: {tool_args}")

                # Execute tool via MCP server
                tool_result = mcp_server.execute_tool(
                    tool_name=tool_name,
                    user_id=user_id,
                    **tool_args
                )

                # T041: Translate tool errors to user-friendly messages
                if not tool_result.get("success", True):
                    error_msg = tool_result.get("error", "Unknown error")
                    logger.warning(f"Tool '{tool_name}' failed for user {user_id}: {error_msg}")

                    # Translate technical errors
                    if "not found" in error_msg.lower():
                        tool_result["error"] = "The requested item could not be found."
                    elif "invalid" in error_msg.lower() or "validation" in error_msg.lower():
                        tool_result["error"] = "The provided information is invalid. Please check and try again."
                    elif "permission" in error_msg.lower() or "access" in error_msg.lower():
                        tool_result["error"] = "You don't have permission to perform this action."
                    elif "database" in error_msg.lower() or "connection" in error_msg.lower():
                        tool_result["error"] = "A temporary issue occurred. Please try again."
                    else:
                        tool_result["error"] = "An error occurred while processing your request."

                # T043: Validate tool result structure to prevent hallucination
                if not isinstance(tool_result, dict):
                    logger.error(f"Tool '{tool_name}' returned invalid result type: {type(tool_result)}")
                    tool_result = {
                        "success": False,
                        "error": "Tool returned invalid response format"
                    }
                elif "success" not in tool_result:
                    logger.warning(f"Tool '{tool_name}' result missing 'success' field")
                    tool_result["success"] = True  # Assume success if not specified

                # Add tool result to messages
                messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [tool_call.model_dump()]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result)
                })

            # Get final response after tool execution
            final_response = client.chat.completions.create(
                model=agent_config["model"],
                messages=messages
            )

            assistant_content = final_response.choices[0].message.content
        else:
            assistant_content = assistant_message.content

        return {
            "content": assistant_content,
            "tool_calls": tool_calls_made,
            "processing_time_ms": processing_time_ms
        }

    except Exception as e:
        logger.error(f"Error executing agent: {str(e)}")
        raise


def handle_agent_errors(error: Exception) -> str:
    """Handle agent errors and convert to user-friendly messages.

    Args:
        error: Exception that occurred

    Returns:
        User-friendly error message
    """
    error_str = str(error).lower()

    # OpenAI API errors
    if "api key" in error_str or "authentication" in error_str:
        return "I'm having trouble connecting to my AI service. Please contact support."

    if "rate limit" in error_str:
        return "I'm receiving too many requests right now. Please try again in a moment."

    if "timeout" in error_str:
        return "The request took too long. Please try again."

    # Tool errors
    if "not found" in error_str:
        return "I couldn't find that item. Could you provide more details?"

    if "invalid" in error_str:
        return "There was an issue with the information provided. Please check and try again."

    # Generic error
    logger.error(f"Unhandled agent error: {str(error)}")
    return "I encountered an unexpected error. Please try again or contact support if the issue persists."
