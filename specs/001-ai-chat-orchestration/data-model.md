# Data Model: AI Chat Orchestration & Conversation System

**Date**: 2026-01-31
**Feature**: 001-ai-chat-orchestration
**Purpose**: Define database entities, relationships, and validation rules for conversation and message storage

## Entity Definitions

### 1. Conversation

**Purpose**: Represents a chat session between a user and the AI agent. Each conversation maintains independent context and history.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, Auto-generated | Unique conversation identifier |
| user_id | String(255) | Foreign Key → User.id, NOT NULL, Indexed | Owner of the conversation |
| created_at | DateTime | NOT NULL, Default: NOW() | Conversation creation timestamp |
| updated_at | DateTime | NOT NULL, Default: NOW() | Last activity timestamp |

**Relationships**:
- **One-to-Many** with Message: A conversation has many messages
- **Many-to-One** with User: A conversation belongs to one user

**Indexes**:
- `idx_conversation_user_id` on `user_id` - Fast retrieval of user's conversations
- `idx_conversation_updated_at` on `updated_at` - Sort conversations by recent activity

**Validation Rules**:
- user_id must reference existing User record
- created_at cannot be in the future
- updated_at must be >= created_at

**State Transitions**: None (conversations are immutable once created)

**SQLModel Definition**:
```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
import uuid

class Conversation(SQLModel, table=True):
    """Conversation model for chat sessions."""
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        nullable=False
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )
```

---

### 2. Message

**Purpose**: Represents a single message in a conversation. Messages are ordered chronologically and include both user messages and agent responses.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, Auto-generated | Unique message identifier |
| conversation_id | UUID | Foreign Key → Conversation.id, NOT NULL, Indexed | Parent conversation |
| role | Enum | NOT NULL, Values: ['user', 'assistant'], Indexed | Message sender role |
| content | Text | NOT NULL, Max: 10000 chars | Message text content |
| metadata | JSON | Optional | Tool calls, errors, processing time |
| created_at | DateTime | NOT NULL, Default: NOW(), Indexed | Message creation timestamp |

**Relationships**:
- **Many-to-One** with Conversation: A message belongs to one conversation

**Indexes**:
- `idx_message_conversation_created` on `(conversation_id, created_at)` - Efficient conversation history queries
- `idx_message_role` on `role` - Filter by message sender

**Validation Rules**:
- conversation_id must reference existing Conversation record
- role must be either 'user' or 'assistant'
- content cannot be empty string
- content length <= 10,000 characters
- created_at cannot be in the future
- metadata must be valid JSON if provided

**State Transitions**: None (messages are immutable once created)

**Metadata Schema** (optional):
```json
{
  "tool_calls": ["create_task", "list_tasks"],
  "processing_time_ms": 1234,
  "error": null,
  "model": "gpt-4-turbo-preview"
}
```

**SQLModel Definition**:
```python
from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import Field, SQLModel, Column, JSON
from enum import Enum
import uuid

class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    """Message model for conversation messages."""
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True
    )
    conversation_id: str = Field(
        foreign_key="conversation.id",
        index=True,
        nullable=False
    )
    role: MessageRole = Field(
        nullable=False,
        index=True
    )
    content: str = Field(
        nullable=False,
        max_length=10000
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )
```

---

## Entity Relationships Diagram

```
┌─────────────────┐
│      User       │
│  (existing)     │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐
│  Conversation   │
│                 │
│  - id (PK)      │
│  - user_id (FK) │
│  - created_at   │
│  - updated_at   │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐
│    Message      │
│                 │
│  - id (PK)      │
│  - conv_id (FK) │
│  - role         │
│  - content      │
│  - metadata     │
│  - created_at   │
└─────────────────┘
```

---

## Database Migration

**Migration Script** (Alembic or SQLModel):

```python
# Create conversation table
CREATE TABLE conversation (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_conversation_user_id (user_id),
    INDEX idx_conversation_updated_at (updated_at)
);

# Create message table
CREATE TABLE message (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    INDEX idx_message_conversation_created (conversation_id, created_at),
    INDEX idx_message_role (role)
);
```

---

## Query Patterns

### 1. Get User's Conversations (Most Recent First)

```python
statement = (
    select(Conversation)
    .where(Conversation.user_id == user_id)
    .order_by(Conversation.updated_at.desc())
    .limit(20)
)
conversations = session.exec(statement).all()
```

**Performance**: Uses `idx_conversation_user_id` and `idx_conversation_updated_at` indexes.

---

### 2. Load Conversation History (Last N Messages)

```python
statement = (
    select(Message)
    .where(Message.conversation_id == conversation_id)
    .order_by(Message.created_at.desc())
    .limit(50)
)
messages = session.exec(statement).all()
messages_chronological = list(reversed(messages))
```

**Performance**: Uses `idx_message_conversation_created` composite index for efficient range scan.

---

### 3. Create New Conversation

```python
conversation = Conversation(user_id=user_id)
session.add(conversation)
session.commit()
session.refresh(conversation)
```

---

### 4. Save Message to Conversation

```python
message = Message(
    conversation_id=conversation_id,
    role=MessageRole.USER,
    content=content,
    metadata={"processing_time_ms": 0}
)
session.add(message)

# Update conversation timestamp
conversation.updated_at = datetime.utcnow()
session.add(conversation)

session.commit()
```

---

## Data Integrity Constraints

1. **Cascade Deletion**: When a conversation is deleted, all associated messages are automatically deleted
2. **Foreign Key Constraints**: Prevent orphaned messages or conversations
3. **Role Validation**: Ensure role is either 'user' or 'assistant'
4. **Content Validation**: Prevent empty messages
5. **User Isolation**: All queries filtered by user_id to prevent cross-user data access

---

## Storage Estimates

**Assumptions**:
- Average message length: 200 characters
- Average conversation: 20 messages
- Active users: 10,000
- Conversations per user: 5

**Storage Calculation**:
- Message size: ~250 bytes (content + metadata + overhead)
- Messages per user: 5 conversations × 20 messages = 100 messages
- Total messages: 10,000 users × 100 messages = 1,000,000 messages
- Total storage: 1M messages × 250 bytes = ~250 MB

**Conclusion**: Storage requirements are minimal. Database can easily handle millions of messages.

---

## Archival Strategy (Future)

For very long conversations (>100 messages):
1. Keep last 50 messages in active table
2. Archive older messages to separate table
3. Implement conversation summarization
4. Load summary + recent messages for context

**Not implemented in MVP** - current design handles 100+ messages per conversation efficiently.
