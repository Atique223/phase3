# Todo API with JWT Authentication & AI Chat

A secure, production-ready FastAPI backend for a multi-user Todo application with JWT-based authentication and AI-powered chat assistant.

## Features

- JWT-based authentication using tokens issued by Better Auth
- Strict per-user data isolation
- Full CRUD operations for tasks
- Task completion toggling
- **AI Chat Assistant** - Natural language task management via OpenAI
- **Conversation Management** - Multi-turn conversations with context preservation
- **MCP Tools** - Model Context Protocol for stateless, user-scoped operations
- RESTful API design
- Proper error handling with appropriate HTTP status codes
- Integration-ready for Next.js frontend

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLModel
- **Authentication**: JWT with PyJWT
- **Database**: PostgreSQL (compatible with Neon Serverless)
- **AI**: OpenAI API with function calling
- **Tools**: MCP (Model Context Protocol) for agent tools
- **Testing**: pytest

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the backend root with the following variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database_name

# Authentication
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000

# OpenAI (Required for AI chat)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
```

**Note**: `OPENAI_API_KEY` is required for the AI chat functionality to work.

## Running the Application

### Development

```bash
uvicorn src.main:app --reload
```

### Production

```bash
gunicorn src.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## API Documentation

Once running, API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

All endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Task Management

- `GET /api/users/{user_id}/tasks` - Get all tasks for a user
- `POST /api/users/{user_id}/tasks` - Create a new task for a user
- `GET /api/users/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/users/{user_id}/tasks/{task_id}` - Update a specific task
- `DELETE /api/users/{user_id}/tasks/{task_id}` - Delete a specific task
- `PATCH /api/users/{user_id}/tasks/{task_id}/complete` - Toggle task completion status

### AI Chat Assistant

- `POST /api/users/{user_id}/chat` - Send a message to the AI chat assistant

**Request Body:**
```json
{
  "message": "Create a task to buy groceries",
  "conversation_id": "optional-uuid-for-continuing-conversation"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "message": {
    "role": "assistant",
    "content": "I've created the task 'buy groceries' for you.",
    "created_at": "2024-01-01T12:00:00"
  },
  "metadata": {
    "tool_calls": ["create_task"],
    "processing_time_ms": 1234
  }
}
```

**Features:**
- Natural language task management (create, list, update, delete tasks)
- Multi-turn conversations with context preservation
- Automatic tool selection and execution
- Rate limited to 10 requests per minute per user
- 5-second timeout for agent responses

**Example Conversations:**
```
User: "Create a task to buy groceries"
Assistant: "I've created the task 'buy groceries' for you."

User: "Show me all my tasks"
Assistant: "You have 3 tasks: 1) buy groceries (incomplete), 2) finish report (complete), 3) call dentist (incomplete)"

User: "Mark the first one as done"
Assistant: "I've marked 'buy groceries' as complete."
```

## Security

- All endpoints require JWT authentication
- User data isolation enforced at the API level
- User ID in JWT is validated against the user ID in the request path
- Proper HTTP status codes for unauthorized/forbidden access

## Testing

Run the tests using pytest:

```bash
pytest
```

## Configuration

The application uses Pydantic Settings for configuration management. See `src/config/settings.py` for all configurable options.