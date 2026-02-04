# Implementation Plan: AI Chat Orchestration & Conversation System

**Branch**: `001-ai-chat-orchestration` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chat-orchestration/spec.md`

## Summary

Implement an AI-powered chat orchestration system that enables users to manage todos through natural language conversations. The system integrates OpenAI Agents SDK with MCP tools in a stateless architecture where all conversation state persists in the database. The agent interprets user intent, selects appropriate MCP tools, and returns user-friendly responses. The chat endpoint integrates with ChatKit frontend and enforces JWT authentication for all requests.

**Core Flow**: User sends message → FastAPI endpoint validates JWT → Load conversation history from DB → Initialize agent with MCP tools → Agent processes message and calls tools → Persist messages to DB → Return response to frontend

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.0.16, OpenAI Agents SDK (latest), MCP SDK (official), PyJWT 2.8+
**Storage**: Neon Serverless PostgreSQL (production), SQLite (development/testing)
**Testing**: pytest 7.4+, pytest-asyncio 0.23+, httpx 0.25+ for API testing
**Target Platform**: Linux server (Docker containerized)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <5 second response time, 100 concurrent sessions, 95% success rate
**Constraints**: Stateless execution, no agent memory beyond DB, JWT required for all requests
**Scale/Scope**: Multi-user system, unlimited conversations per user, 100+ messages per conversation

**AI/Agent Architecture**:
**Agent Framework**: OpenAI Agents SDK for agent orchestration and tool calling
**MCP Server**: Official MCP SDK for tool definition and registration
**Tool Architecture**: Stateless user-scoped tools (create_task, list_tasks, update_task, delete_task, get_task)
**State Management**: Database-persisted conversations and messages, stateless agent execution
**Agent Constraints**: Tool-only data access, no direct DB queries, user_id scoped from JWT

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Core Principles Compliance**:
- [x] **Tool-first AI**: All data changes via MCP tools only, no direct DB access from agent
- [x] **Stateless execution**: No server memory beyond database, conversation state persisted
- [x] **Agentic correctness**: Agent behavior traceable to specs, no emergent behaviors
- [x] **Separation of concerns**: Clear layer boundaries (agent/tools/UI/storage)
- [x] **Recoverability**: Conversations resume after restarts via persisted state
- [x] **Spec-driven development**: Feature follows Spec → Plan → Tasks → Implement workflow
- [x] **Multi-user data isolation**: All operations scoped per authenticated user via JWT
- [x] **Security first**: JWT authentication enforced for all API endpoints
- [x] **Implementation automation**: No manual coding, all via Claude Code

**Standards Compliance**:
- [x] Correct framework versions (OpenAI Agents SDK, FastAPI 0.104+, MCP SDK)
- [x] MCP tools are stateless and user-scoped
- [x] Configuration via environment variables only (OPENAI_API_KEY, DATABASE_URL)
- [x] Database schema supports multi-user isolation (user_id foreign keys)
- [x] Testing strategy includes unit, integration, and E2E tests
- [x] Conversation recovery tests included

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chat-orchestration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: OpenAI Agents SDK + MCP research
├── data-model.md        # Phase 1: Conversation + Message models
├── quickstart.md        # Phase 1: Setup and testing guide
├── contracts/           # Phase 1: API contracts
│   └── chat-api.yaml    # OpenAPI spec for chat endpoint
└── checklists/
    └── requirements.md  # Spec quality validation
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py              # Existing
│   │   ├── task.py              # Existing
│   │   ├── conversation.py      # NEW: Conversation model
│   │   └── message.py           # NEW: Message model
│   ├── services/
│   │   ├── agent_service.py     # NEW: Agent initialization and execution
│   │   └── conversation_service.py  # NEW: Conversation management
│   ├── mcp/
│   │   ├── __init__.py          # NEW: MCP module
│   │   ├── server.py            # NEW: MCP server setup
│   │   └── tools/               # NEW: MCP tool implementations
│   │       ├── __init__.py
│   │       ├── task_tools.py    # NEW: Task CRUD tools
│   │       └── base.py          # NEW: Base tool class
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Existing
│   │       ├── tasks.py         # Existing
│   │       └── chat.py          # NEW: Chat endpoint
│   ├── schemas/
│   │   ├── task.py              # Existing
│   │   ├── conversation.py      # NEW: Conversation schemas
│   │   └── message.py           # NEW: Message schemas
│   ├── auth/
│   │   ├── deps.py              # Existing
│   │   └── jwt_utils.py         # Existing
│   ├── config/
│   │   └── settings.py          # UPDATE: Add OpenAI API key
│   └── main.py                  # UPDATE: Register chat router
└── tests/
    ├── unit/
    │   ├── test_mcp_tools.py    # NEW: MCP tool unit tests
    │   └── test_agent_service.py # NEW: Agent service tests
    ├── integration/
    │   ├── test_chat_endpoint.py # NEW: Chat API integration tests
    │   └── test_conversation_flow.py # NEW: Multi-turn conversation tests
    └── e2e/
        └── test_chat_recovery.py # NEW: Server restart recovery tests

frontend/
├── src/
│   ├── components/
│   │   └── chat/                # Existing ChatKit integration
│   └── services/
│       └── chat-api.ts          # UPDATE: Add chat endpoint calls
```

**Structure Decision**: Web application structure (Option 2) selected. Backend handles all agent logic, MCP tools, and database operations. Frontend uses ChatKit for UI and calls backend chat API. Clear separation between presentation (frontend) and business logic (backend).

## Complexity Tracking

> No constitution violations. All principles satisfied by design.

## Architecture Decisions

### 1. Conversation Lifecycle

**Decision**: Conversations are created automatically on first message if no conversation_id provided. Subsequent messages include conversation_id to continue existing conversation.

**Rationale**: Simplifies frontend logic - no separate "create conversation" call needed. Backend handles conversation creation transparently.

**Flow**:
1. User sends first message without conversation_id
2. Backend creates new Conversation record
3. Backend returns conversation_id in response
4. Frontend includes conversation_id in subsequent messages
5. Backend loads conversation history and appends new messages

### 2. Agent Initialization

**Decision**: Agent is initialized per-request with MCP tools registered at startup. No persistent agent instance.

**Rationale**: Stateless execution requirement. Each request is independent. Agent configuration loaded from environment variables.

**Implementation**:
- MCP server initialized once at application startup
- Tools registered with MCP server (create_task, list_tasks, etc.)
- Per-request: Create agent instance, pass user_id context, execute with conversation history
- Agent discarded after response generated

### 3. MCP Tool Design

**Decision**: Each MCP tool is a stateless function that receives user_id and parameters, queries database, returns result.

**Rationale**: Tool-first AI principle. Tools enforce user isolation. Agent cannot bypass tools to access database.

**Tool Signatures**:
```python
create_task(user_id: str, title: str, description: str = None) -> Task
list_tasks(user_id: str, completed: bool = None) -> List[Task]
get_task(user_id: str, task_id: int) -> Task
update_task(user_id: str, task_id: int, **updates) -> Task
delete_task(user_id: str, task_id: int) -> bool
```

### 4. Error Handling Strategy

**Decision**: Three-tier error handling:
1. Tool errors: Returned to agent as structured error objects
2. Agent errors: Caught by service layer, logged, converted to user-friendly messages
3. API errors: Standard HTTP status codes with JSON error responses

**Rationale**: Agent should handle tool errors gracefully (e.g., "task not found" → "I couldn't find that task"). System errors logged for debugging but not exposed to users.

### 5. Conversation History Management

**Decision**: Load last N messages (default 50) from database before agent execution. Older messages archived but not loaded.

**Rationale**: Balance between context preservation and performance. 50 messages provides sufficient context for most conversations without excessive token usage.

**Implementation**:
- Query: `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 50`
- Reverse order for chronological context
- Future: Implement conversation summarization for very long conversations

### 6. ChatKit Integration

**Decision**: Backend returns responses in ChatKit-compatible format: `{role: "assistant", content: "...", conversation_id: "..."}`

**Rationale**: Frontend expects specific format. Backend adapts to frontend contract.

**Response Format**:
```json
{
  "conversation_id": "uuid",
  "message": {
    "role": "assistant",
    "content": "I've created the task 'buy groceries'",
    "created_at": "2026-01-31T12:00:00Z"
  },
  "metadata": {
    "tool_calls": ["create_task"],
    "processing_time_ms": 1234
  }
}
```

## Phase 0: Research & Technology Validation

### Research Tasks

1. **OpenAI Agents SDK Integration**
   - Research: Official documentation, authentication patterns, tool calling API
   - Validate: Can agent call custom functions? How to pass user context?
   - Output: Code examples for agent initialization and tool registration

2. **MCP SDK Setup**
   - Research: Official MCP SDK documentation, tool definition format, server setup
   - Validate: Can MCP tools receive user_id context? How to register tools?
   - Output: MCP server initialization code and tool registration pattern

3. **Stateless Agent Execution**
   - Research: Best practices for stateless AI agents, conversation history management
   - Validate: How to load conversation history? Token limits for context?
   - Output: Conversation history loading strategy and token management approach

4. **Database Schema Design**
   - Research: Conversation and message storage patterns, indexing strategies
   - Validate: How to efficiently query conversation history? Indexes needed?
   - Output: Database schema with indexes and foreign key constraints

5. **Error Handling Patterns**
   - Research: Agent error handling, tool error propagation, user-friendly error messages
   - Validate: How to catch agent errors? How to translate technical errors?
   - Output: Error handling middleware and message translation patterns

### Research Output Location

All research findings documented in `specs/001-ai-chat-orchestration/research.md`

## Phase 1: Design & Contracts

### Data Models

**File**: `specs/001-ai-chat-orchestration/data-model.md`

**Entities**:

1. **Conversation**
   - id: UUID (primary key)
   - user_id: String (foreign key to User, indexed)
   - created_at: DateTime
   - updated_at: DateTime
   - Relationships: One-to-many with Message

2. **Message**
   - id: UUID (primary key)
   - conversation_id: UUID (foreign key to Conversation, indexed)
   - role: Enum["user", "assistant"] (indexed for filtering)
   - content: Text (message content)
   - metadata: JSON (optional: tool_calls, errors, processing_time)
   - created_at: DateTime (indexed for ordering)
   - Relationships: Many-to-one with Conversation

**Indexes**:
- conversation.user_id (for user's conversations list)
- message.conversation_id + message.created_at (for conversation history queries)
- message.role (for filtering user vs assistant messages)

### API Contracts

**File**: `specs/001-ai-chat-orchestration/contracts/chat-api.yaml`

**Endpoint**: `POST /api/v1/users/{user_id}/chat`

**Request**:
```json
{
  "message": "add a task to buy groceries",
  "conversation_id": "uuid-optional"
}
```

**Response** (200 OK):
```json
{
  "conversation_id": "uuid",
  "message": {
    "role": "assistant",
    "content": "I've created the task 'buy groceries'",
    "created_at": "2026-01-31T12:00:00Z"
  },
  "metadata": {
    "tool_calls": ["create_task"],
    "processing_time_ms": 1234
  }
}
```

**Error Responses**:
- 401: Unauthorized (invalid/missing JWT)
- 400: Bad Request (empty message, invalid conversation_id)
- 403: Forbidden (user_id mismatch)
- 500: Internal Server Error (agent/tool failure)

### Quickstart Guide

**File**: `specs/001-ai-chat-orchestration/quickstart.md`

**Contents**:
1. Environment setup (OPENAI_API_KEY, DATABASE_URL)
2. Database migration (create conversation and message tables)
3. Start backend server
4. Test chat endpoint with curl/Postman
5. Verify conversation persistence
6. Test server restart recovery

## Implementation Phases

### Phase 1: Database Models & Schemas

**Tasks**:
1. Create Conversation model in `backend/src/models/conversation.py`
2. Create Message model in `backend/src/models/message.py`
3. Create Conversation schemas in `backend/src/schemas/conversation.py`
4. Create Message schemas in `backend/src/schemas/message.py`
5. Update database.py to register new models
6. Run database migration to create tables

### Phase 2: MCP Tools Implementation

**Tasks**:
1. Create MCP module structure (`backend/src/mcp/`)
2. Implement base tool class in `backend/src/mcp/tools/base.py`
3. Implement task tools in `backend/src/mcp/tools/task_tools.py`:
   - create_task(user_id, title, description)
   - list_tasks(user_id, completed)
   - get_task(user_id, task_id)
   - update_task(user_id, task_id, **updates)
   - delete_task(user_id, task_id)
4. Implement MCP server in `backend/src/mcp/server.py`
5. Register tools with MCP server
6. Write unit tests for each tool

### Phase 3: Agent Service

**Tasks**:
1. Create agent service in `backend/src/services/agent_service.py`:
   - initialize_agent(user_id, openai_api_key)
   - execute_agent(agent, message, conversation_history)
   - handle_agent_errors(error)
2. Create conversation service in `backend/src/services/conversation_service.py`:
   - get_or_create_conversation(user_id, conversation_id)
   - load_conversation_history(conversation_id, limit)
   - save_message(conversation_id, role, content, metadata)
3. Write unit tests for services

### Phase 4: Chat API Endpoint

**Tasks**:
1. Create chat router in `backend/src/api/v1/chat.py`
2. Implement POST /users/{user_id}/chat endpoint:
   - Validate JWT and extract user_id
   - Validate request body (message, conversation_id)
   - Get or create conversation
   - Load conversation history
   - Initialize agent with MCP tools
   - Execute agent with message and history
   - Save user message and agent response
   - Return response in ChatKit format
3. Add error handling middleware
4. Register chat router in main.py
5. Write integration tests

### Phase 5: Configuration & Environment

**Tasks**:
1. Update settings.py to include OPENAI_API_KEY
2. Update .env.example with new variables
3. Update requirements.txt with new dependencies:
   - openai-agents-sdk
   - mcp-sdk
4. Update Docker configuration if needed

### Phase 6: Testing & Validation

**Tasks**:
1. Write E2E tests for conversation recovery after restart
2. Write integration tests for multi-turn conversations
3. Write performance tests for concurrent sessions
4. Validate JWT authentication on chat endpoint
5. Validate user isolation (no cross-user data access)
6. Validate agent tool selection accuracy

## Testing Strategy

### Unit Tests
- MCP tool functions (mock database)
- Agent service (mock OpenAI API)
- Conversation service (mock database)

### Integration Tests
- Chat endpoint with real database
- Multi-turn conversation flow
- Error handling scenarios

### E2E Tests
- Server restart recovery
- Concurrent user sessions
- Long conversation handling (>50 messages)

### Performance Tests
- 100 concurrent chat sessions
- Response time <5 seconds
- Database query performance

## Deployment Considerations

1. **Environment Variables**:
   - OPENAI_API_KEY (required)
   - DATABASE_URL (Neon PostgreSQL connection string)
   - BETTER_AUTH_SECRET (existing)
   - MCP_SERVER_PORT (optional, default 8080)

2. **Database Migration**:
   - Run migration to create conversation and message tables
   - Create indexes for performance
   - Verify foreign key constraints

3. **Monitoring**:
   - Log all agent interactions
   - Track tool call success/failure rates
   - Monitor response times
   - Alert on error rate >5%

4. **Scaling**:
   - Stateless design enables horizontal scaling
   - Database connection pooling for concurrent requests
   - Consider caching for frequently accessed conversations

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API rate limits | High | Implement retry logic with exponential backoff |
| Long conversation history exceeds token limits | Medium | Load last 50 messages, implement summarization |
| Agent hallucination (inventing data) | High | Strict tool-only data access, validate all tool responses |
| Concurrent message processing | Medium | Use database transactions, optimistic locking |
| JWT token expiry mid-conversation | Low | Frontend handles token refresh, backend returns 401 |
| MCP tool errors not handled gracefully | Medium | Comprehensive error handling in agent service |

## Success Metrics

- ✅ Chat endpoint responds within 5 seconds
- ✅ 95% of messages result in successful responses
- ✅ Conversations resume after server restart
- ✅ Agent selects correct tools 90% of the time
- ✅ Zero cross-user data leakage
- ✅ All tests pass (unit, integration, E2E)
