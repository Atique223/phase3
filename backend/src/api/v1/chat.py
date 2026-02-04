"""Chat API routes for AI-powered todo management."""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
import logging
import time
import asyncio
from slowapi import Limiter
from slowapi.util import get_remote_address

from ...auth.deps import get_user_id_from_token
from ...auth.jwt_utils import validate_user_access
from ...services.conversation_service import (
    get_or_create_conversation,
    load_conversation_history,
    save_message
)
from ...services.agent_service import execute_agent, handle_agent_errors
from ...models.message import MessageRole

logger = logging.getLogger(__name__)

router = APIRouter()

# T047: Request timeout configuration (15 seconds for two-step OpenAI calls)
CHAT_REQUEST_TIMEOUT = 15.0

# T048: Rate limiting configuration (10 requests per minute per user)
limiter = Limiter(key_func=get_remote_address)


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str = Field(min_length=1, max_length=10000)
    conversation_id: Optional[str] = None


class MessageResponse(BaseModel):
    """Response schema for message."""
    role: str
    content: str
    created_at: str


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    conversation_id: str
    message: MessageResponse
    metadata: dict


@router.post("/users/{user_id}/chat", response_model=ChatResponse, tags=["chat"])
@limiter.limit("10/minute")  # T048: Rate limit to 10 requests per minute
async def chat_endpoint(
    request: Request,
    user_id: str,
    chat_request: ChatRequest,
    current_user_id: str = Depends(get_user_id_from_token)
):
    """
    Send a message to the AI chat agent for todo management.

    Args:
        request: FastAPI request object (for rate limiting)
        user_id: The ID of the user
        chat_request: Chat request with message and optional conversation_id
        current_user_id: The ID of the authenticated user (from JWT)

    Returns:
        Chat response with conversation_id, agent message, and metadata

    Raises:
        HTTPException: If validation fails or errors occur
    """
    start_time = time.time()

    try:
        # T026: JWT validation and user_id extraction (handled by dependency)
        # T027: Validate that the user in JWT matches the requested user_id
        if not validate_user_access(current_user_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied - you can only access your own conversations"
            )

        # T027: Request body validation (message, conversation_id)
        if not chat_request.message or not chat_request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )

        # T028: Get or create conversation
        try:
            conversation = get_or_create_conversation(
                user_id=user_id,
                conversation_id=chat_request.conversation_id
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        # Load conversation history
        conversation_history = load_conversation_history(
            conversation_id=conversation.id,
            limit=50
        )

        # T030: Save user message
        user_message = save_message(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=chat_request.message,
            metadata=None
        )

        # T029: Execute agent with message and history
        # T047: Apply timeout to agent execution
        try:
            agent_response = await asyncio.wait_for(
                asyncio.to_thread(
                    execute_agent,
                    user_id=user_id,
                    message=chat_request.message,
                    conversation_history=conversation_history
                ),
                timeout=CHAT_REQUEST_TIMEOUT
            )

            agent_content = agent_response["content"]
            tool_calls = agent_response["tool_calls"]
            processing_time_ms = agent_response["processing_time_ms"]

        except asyncio.TimeoutError:
            # T047: Handle timeout
            logger.warning(f"Agent execution timeout for user {user_id} after {CHAT_REQUEST_TIMEOUT}s")
            agent_content = "I'm taking longer than expected to process your request. Please try again or simplify your message."
            tool_calls = []
            processing_time_ms = int(CHAT_REQUEST_TIMEOUT * 1000)

        except Exception as e:
            # T032: Error handling - convert to user-friendly message
            logger.error(f"Agent execution error: {str(e)}")
            agent_content = handle_agent_errors(e)
            tool_calls = []
            processing_time_ms = int((time.time() - start_time) * 1000)

        # T030: Save agent message
        agent_message = save_message(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=agent_content,
            metadata={
                "tool_calls": tool_calls,
                "processing_time_ms": processing_time_ms
            }
        )

        # T031: Return ChatKit-compatible response
        return ChatResponse(
            conversation_id=conversation.id,
            message=MessageResponse(
                role="assistant",
                content=agent_content,
                created_at=agent_message.created_at.isoformat()
            ),
            metadata={
                "tool_calls": tool_calls,
                "processing_time_ms": processing_time_ms
            }
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # T032: Handle unexpected errors
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )
