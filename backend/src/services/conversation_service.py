"""Conversation service for managing conversations and messages."""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select
from ..models.conversation import Conversation
from ..models.message import Message, MessageRole
from ..models.database import engine
import logging

logger = logging.getLogger(__name__)


def get_or_create_conversation(
    user_id: str,
    conversation_id: Optional[str] = None
) -> Conversation:
    """Get existing conversation or create new one.

    Args:
        user_id: User ID
        conversation_id: Optional conversation ID to retrieve

    Returns:
        Conversation instance

    Raises:
        ValueError: If conversation_id provided but not found or doesn't belong to user
    """
    with Session(engine) as session:
        if conversation_id:
            # Try to get existing conversation
            statement = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
            conversation = session.exec(statement).first()

            if not conversation:
                raise ValueError(
                    f"Conversation {conversation_id} not found or does not belong to user"
                )

            return conversation
        else:
            # Create new conversation
            conversation = Conversation(user_id=user_id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

            logger.info(f"Created new conversation {conversation.id} for user {user_id}")
            return conversation


def load_conversation_history(
    conversation_id: str,
    limit: int = 50
) -> List[Message]:
    """Load conversation history (last N messages).

    Args:
        conversation_id: Conversation ID
        limit: Maximum number of messages to load (default 50)

    Returns:
        List of messages in chronological order
    """
    with Session(engine) as session:
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = session.exec(statement).all()

        # Reverse to get chronological order (oldest first)
        return list(reversed(messages))


def save_message(
    conversation_id: str,
    role: MessageRole,
    content: str,
    metadata: Optional[dict] = None
) -> Message:
    """Save a message to the conversation.

    Args:
        conversation_id: Conversation ID
        role: Message role (user or assistant)
        content: Message content
        metadata: Optional metadata (tool calls, processing time, etc.)

    Returns:
        Created message instance
    """
    with Session(engine) as session:
        # Create message
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            message_metadata=metadata
        )
        session.add(message)

        # Update conversation timestamp
        conversation = session.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)

        session.commit()
        session.refresh(message)

        logger.info(f"Saved {role} message to conversation {conversation_id}")
        return message
