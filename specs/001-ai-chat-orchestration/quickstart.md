# Quickstart Guide: AI Chat Orchestration & Conversation System

**Date**: 2026-01-31
**Feature**: 001-ai-chat-orchestration
**Purpose**: Setup instructions and testing guide for local development

## Prerequisites

- Python 3.11+
- PostgreSQL (or SQLite for development)
- OpenAI API key
- Existing Phase II backend running (User and Task models)

## Environment Setup

### 1. Install Dependencies

Add new dependencies to `backend/requirements.txt`:

```bash
# Existing dependencies
fastapi==0.104.1
sqlmodel==0.0.16
pydantic==2.5.0
pydantic-settings==2.1.0
PyJWT==2.8.0
passlib[bcrypt]==1.7.4
python-jose==3.3.0
python-multipart==0.0.6
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.23.2
httpx==0.25.2
uvicorn[standard]==0.24.0.post1
gunicorn==21.2.0

# NEW: AI Chat dependencies
openai==1.10.0
mcp-python-sdk==0.1.0
```

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Update `backend/.env`:

```bash
# Existing variables
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
# Or for development: DATABASE_URL=sqlite:///./test.db
BETTER_AUTH_SECRET=your-secret-key-here

# NEW: OpenAI API configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# NEW: MCP configuration (optional)
MCP_SERVER_PORT=8080
```

**Get OpenAI API Key**:
1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Copy key to `.env` file

### 3. Database Migration

Run database migration to create conversation and message tables:

**Option A: Using SQLModel (automatic)**

The tables will be created automatically on application startup via `create_db_and_tables()` in `main.py`.

**Option B: Manual SQL (for production)**

```sql
-- Create conversation table
CREATE TABLE conversation (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_conversation_updated_at ON conversation(updated_at);

-- Create message table
CREATE TABLE message (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE
);

CREATE INDEX idx_message_conversation_created ON message(conversation_id, created_at);
CREATE INDEX idx_message_role ON message(role);
```

Verify tables created:

```bash
# PostgreSQL
psql -d todo_db -c "\dt"

# SQLite
sqlite3 test.db ".tables"
```

## Running the Application

### 1. Start Backend Server

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8001
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete.
Creating database tables...
Database tables created.
MCP server initialized with 5 tools
```

### 2. Verify Server Health

```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## Testing the Chat Endpoint

### 1. Create Test User and Get JWT Token

**Register user**:
```bash
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login to get JWT token**:
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token and user_id for subsequent requests.

### 2. Test Chat Endpoint - New Conversation

**Send first message** (creates new conversation):

```bash
curl -X POST http://localhost:8001/api/v1/users/{user_id}/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "show me my tasks"
  }'
```

Expected response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": {
    "role": "assistant",
    "content": "You don't have any tasks yet. Would you like to create one?",
    "created_at": "2026-01-31T12:00:00Z"
  },
  "metadata": {
    "tool_calls": ["list_tasks"],
    "processing_time_ms": 1234
  }
}
```

### 3. Test Chat Endpoint - Continue Conversation

**Send follow-up message** (uses conversation_id from previous response):

```bash
curl -X POST http://localhost:8001/api/v1/users/{user_id}/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "add a task to buy groceries",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Expected response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": {
    "role": "assistant",
    "content": "I've created the task 'buy groceries' for you.",
    "created_at": "2026-01-31T12:01:00Z"
  },
  "metadata": {
    "tool_calls": ["create_task"],
    "processing_time_ms": 987
  }
}
```

### 4. Verify Task Created

Check that the task was actually created:

```bash
curl -X GET http://localhost:8001/api/v1/users/{user_id}/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
[
  {
    "id": 1,
    "title": "buy groceries",
    "description": null,
    "completed": false,
    "user_id": "user_123abc",
    "created_at": "2026-01-31T12:01:00Z",
    "updated_at": "2026-01-31T12:01:00Z"
  }
]
```

## Testing Conversation Persistence

### 1. Verify Conversation in Database

**PostgreSQL**:
```sql
SELECT * FROM conversation WHERE user_id = 'user_123abc';
SELECT * FROM message WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY created_at;
```

**SQLite**:
```bash
sqlite3 test.db "SELECT * FROM conversation WHERE user_id = 'user_123abc';"
sqlite3 test.db "SELECT * FROM message WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY created_at;"
```

Expected output:
- 1 conversation record
- 4 message records (2 user messages + 2 assistant responses)

### 2. Test Server Restart Recovery

**Step 1**: Send a message and note the conversation_id

**Step 2**: Restart the backend server
```bash
# Stop server (Ctrl+C)
# Start server again
python -m uvicorn src.main:app --reload --port 8001
```

**Step 3**: Send another message with the same conversation_id
```bash
curl -X POST http://localhost:8001/api/v1/users/{user_id}/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "what tasks do I have?",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Expected**: Agent should remember previous context and respond appropriately (e.g., "You have 1 task: buy groceries").

## Testing Error Scenarios

### 1. Missing JWT Token (401)

```bash
curl -X POST http://localhost:8001/api/v1/users/{user_id}/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "test"
  }'
```

Expected: `401 Unauthorized`

### 2. Empty Message (400)

```bash
curl -X POST http://localhost:8001/api/v1/users/{user_id}/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": ""
  }'
```

Expected: `400 Bad Request - Message cannot be empty`

### 3. Invalid Conversation ID (400)

```bash
curl -X POST http://localhost:8001/api/v1/users/{user_id}/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "test",
    "conversation_id": "invalid-uuid"
  }'
```

Expected: `400 Bad Request - Invalid conversation ID`

### 4. User ID Mismatch (403)

```bash
curl -X POST http://localhost:8001/api/v1/users/different_user_id/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "test"
  }'
```

Expected: `403 Forbidden - Access denied`

## Running Tests

### Unit Tests

```bash
cd backend
pytest tests/unit/test_mcp_tools.py -v
pytest tests/unit/test_agent_service.py -v
```

### Integration Tests

```bash
pytest tests/integration/test_chat_endpoint.py -v
pytest tests/integration/test_conversation_flow.py -v
```

### E2E Tests

```bash
pytest tests/e2e/test_chat_recovery.py -v
```

### All Tests

```bash
pytest tests/ -v --cov=src --cov-report=html
```

## Troubleshooting

### Issue: "OpenAI API key not found"

**Solution**: Verify `OPENAI_API_KEY` is set in `.env` file and server was restarted after adding it.

### Issue: "Table 'conversation' doesn't exist"

**Solution**: Run database migration manually or ensure `create_db_and_tables()` is called on startup.

### Issue: "Agent not responding / timeout"

**Solution**:
1. Check OpenAI API key is valid
2. Verify internet connection
3. Check OpenAI API status: https://status.openai.com
4. Review backend logs for errors

### Issue: "Conversation context not preserved"

**Solution**:
1. Verify conversation_id is being passed in subsequent requests
2. Check database for message records
3. Ensure conversation history loading is working (check logs)

### Issue: "Cross-user data access"

**Solution**: This should never happen. If it does:
1. Check JWT validation in endpoint
2. Verify user_id is extracted correctly from JWT
3. Ensure MCP tools filter by user_id
4. Report as critical security bug

## Next Steps

1. **Frontend Integration**: Update ChatKit frontend to call the new chat endpoint
2. **Monitoring**: Set up logging and monitoring for agent interactions
3. **Performance Testing**: Test with 100 concurrent users
4. **Production Deployment**: Deploy to production with Neon PostgreSQL

## Support

For issues or questions:
- Check backend logs: `backend/app.log`
- Review API documentation: `contracts/chat-api.yaml`
- Consult implementation plan: `plan.md`
