# Research: AI Chat Orchestration & Conversation System

**Date**: 2026-01-31
**Feature**: 001-ai-chat-orchestration
**Purpose**: Technology validation and best practices research for OpenAI Agents SDK + MCP integration

## 1. OpenAI Agents SDK Integration

### Research Findings

**Documentation**: OpenAI Agents SDK provides a high-level abstraction for building AI agents with tool calling capabilities. The SDK handles conversation management, tool registration, and response generation.

**Key Capabilities**:
- Agent initialization with system prompts and tool definitions
- Automatic tool calling based on user intent
- Conversation history management
- Error handling and retry logic
- Streaming and non-streaming responses

**Authentication Pattern**:
```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
agent = client.beta.agents.create(
    model="gpt-4-turbo-preview",
    instructions="You are a helpful todo management assistant...",
    tools=[...]
)
```

**Tool Calling API**:
- Tools defined as JSON schemas with function signatures
- Agent automatically selects tools based on user message
- Tool results returned to agent for response generation

**User Context Passing**:
- User context (user_id) passed via tool parameters
- Each tool receives user_id as first parameter
- Agent instructions include user context handling guidelines

**Code Example**:
```python
def initialize_agent(user_id: str, tools: List[dict]) -> Agent:
    """Initialize agent with user context and MCP tools."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    agent = client.beta.agents.create(
        model="gpt-4-turbo-preview",
        instructions=f"""You are a helpful todo management assistant for user {user_id}.
        Use the provided tools to help users manage their tasks.
        Always confirm actions taken and provide clear, friendly responses.""",
        tools=tools
    )

    return agent
```

**Decision**: Use OpenAI Agents SDK for agent orchestration. SDK provides robust tool calling and conversation management out of the box.

---

## 2. MCP SDK Setup

### Research Findings

**Documentation**: Model Context Protocol (MCP) SDK provides a standardized way to define and register tools that AI agents can use. MCP tools are stateless functions with well-defined schemas.

**Tool Definition Format**:
```python
from mcp import Tool, ToolParameter

tool = Tool(
    name="create_task",
    description="Create a new task for the user",
    parameters=[
        ToolParameter(name="user_id", type="string", required=True),
        ToolParameter(name="title", type="string", required=True),
        ToolParameter(name="description", type="string", required=False)
    ],
    handler=create_task_handler
)
```

**Server Setup**:
```python
from mcp import MCPServer

server = MCPServer()
server.register_tool(create_task_tool)
server.register_tool(list_tasks_tool)
server.register_tool(update_task_tool)
server.register_tool(delete_task_tool)
server.register_tool(get_task_tool)
```

**User Context in Tools**:
- Tools receive user_id as first parameter
- Tool handler validates user_id matches JWT claim
- Tools query database with user_id filter for isolation

**Tool Registration Pattern**:
```python
def register_mcp_tools(server: MCPServer):
    """Register all MCP tools with the server."""
    tools = [
        create_task_tool,
        list_tasks_tool,
        get_task_tool,
        update_task_tool,
        delete_task_tool
    ]

    for tool in tools:
        server.register_tool(tool)

    return server
```

**Decision**: Use official MCP SDK for tool definition and registration. MCP provides standardized tool schemas that integrate seamlessly with OpenAI Agents SDK.

---

## 3. Stateless Agent Execution

### Research Findings

**Best Practices**:
1. **No Persistent Agent State**: Create new agent instance per request
2. **Conversation History from Database**: Load messages from DB before agent execution
3. **Token Limit Management**: Limit conversation history to prevent token overflow
4. **Context Window**: GPT-4 Turbo supports 128k tokens, but practical limit is ~50 messages

**Conversation History Loading**:
```python
def load_conversation_history(conversation_id: str, limit: int = 50) -> List[Message]:
    """Load last N messages from conversation."""
    with Session(engine) as session:
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = session.exec(statement).all()
        return list(reversed(messages))  # Chronological order
```

**Token Management**:
- Average message: ~100 tokens
- 50 messages: ~5,000 tokens
- System prompt + tools: ~2,000 tokens
- Total context: ~7,000 tokens (well within 128k limit)

**Stateless Execution Pattern**:
```python
def execute_agent(user_id: str, message: str, conversation_id: str) -> str:
    """Execute agent with conversation history."""
    # Load history
    history = load_conversation_history(conversation_id, limit=50)

    # Initialize agent (fresh instance)
    agent = initialize_agent(user_id, mcp_tools)

    # Execute with history
    response = agent.run(
        messages=[
            *[{"role": msg.role, "content": msg.content} for msg in history],
            {"role": "user", "content": message}
        ]
    )

    return response
```

**Decision**: Load last 50 messages per request. Create fresh agent instance per request. No persistent agent state.

---

## 4. Database Schema Design

### Research Findings

**Conversation Storage Patterns**:
- UUID primary keys for conversations and messages
- Foreign key from conversation to user
- Foreign key from message to conversation
- Indexes on user_id, conversation_id, created_at for efficient queries

**Schema Design**:

**Conversation Table**:
```sql
CREATE TABLE conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES user(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_conversation_user_id (user_id)
);
```

**Message Table**:
```sql
CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_message_conversation_created (conversation_id, created_at),
    INDEX idx_message_role (role)
);
```

**Query Performance**:
- Composite index on (conversation_id, created_at) enables efficient history queries
- Index on user_id enables fast conversation list retrieval
- Cascade delete ensures messages deleted when conversation deleted

**Decision**: Use UUID primary keys, composite indexes for performance, JSONB for metadata flexibility.

---

## 5. Error Handling Patterns

### Research Findings

**Three-Tier Error Handling**:

**Tier 1: Tool Errors**
```python
def create_task_tool(user_id: str, title: str, description: str = None):
    """Create task with error handling."""
    try:
        task = Task(user_id=user_id, title=title, description=description)
        with Session(engine) as session:
            session.add(task)
            session.commit()
            session.refresh(task)
            return {"success": True, "task": task.dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**Tier 2: Agent Errors**
```python
def execute_agent_with_error_handling(user_id: str, message: str, conversation_id: str):
    """Execute agent with comprehensive error handling."""
    try:
        response = execute_agent(user_id, message, conversation_id)
        return response
    except OpenAIError as e:
        logger.error(f"OpenAI API error: {e}")
        return "I'm having trouble processing your request. Please try again."
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return "An unexpected error occurred. Please contact support."
```

**Tier 3: API Errors**
```python
@router.post("/users/{user_id}/chat")
async def chat_endpoint(user_id: str, request: ChatRequest):
    """Chat endpoint with HTTP error handling."""
    try:
        # Validate JWT
        if not validate_jwt(request.token):
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Execute agent
        response = execute_agent_with_error_handling(...)
        return {"conversation_id": ..., "message": response}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

**User-Friendly Error Messages**:
- Tool errors: Agent translates to natural language
- Agent errors: Generic "try again" message
- API errors: Standard HTTP status codes

**Decision**: Implement three-tier error handling with logging at each level. Agent translates tool errors to user-friendly messages.

---

## Summary of Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Agent Framework | OpenAI Agents SDK | Robust tool calling, conversation management |
| MCP Integration | Official MCP SDK | Standardized tool schemas, seamless integration |
| Agent State | Stateless per-request | Enables horizontal scaling, simplifies recovery |
| Conversation History | Load last 50 messages | Balances context vs token usage |
| Database Schema | UUID keys, composite indexes | Performance, scalability, data integrity |
| Error Handling | Three-tier with logging | Graceful degradation, debugging support |

## Next Steps

1. Implement database models (Conversation, Message)
2. Implement MCP tools (create_task, list_tasks, etc.)
3. Implement agent service (initialize, execute, error handling)
4. Implement chat API endpoint
5. Write comprehensive tests (unit, integration, E2E)
