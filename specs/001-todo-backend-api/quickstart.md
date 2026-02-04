# Quickstart Guide: Todo Backend API

## Overview
This guide provides the essential information to set up, run, and interact with the Todo Backend API. The backend is built with FastAPI and provides secure, multi-user Todo management with JWT authentication.

## Prerequisites
- Python 3.11+
- pip package manager
- Access to Neon PostgreSQL database
- Better Auth secret key for JWT verification

## Environment Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_WKt3Yy8suNkv@ep-withered-voice-a7pygs7k-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BETTER_AUTH_SECRET=PWaqdnA55xkCQBRUV7MwraRZ3n4RAY1v
BETTER_AUTH_URL=http://localhost:3000
```

## Running the Application

### 1. Start the development server
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Access the API
- API documentation: `http://localhost:8000/docs`
- API redoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token_here>
```

### Available Endpoints

#### List user's tasks
```
GET /api/{user_id}/tasks
```
- Returns a list of tasks belonging to the specified user
- Requires valid JWT with matching user_id

#### Create a new task
```
POST /api/{user_id}/tasks
```
- Creates a new task for the specified user
- Request body: `{ "title": "Task title", "description": "Optional description" }`
- Returns the created task with 201 status

#### Get a specific task
```
GET /api/{user_id}/tasks/{task_id}
```
- Returns details of a specific task
- Requires the task to belong to the specified user

#### Update a task
```
PUT /api/{user_id}/tasks/{task_id}
```
- Updates the specified task
- Request body: `{ "title": "Updated title", "description": "Updated description", "completed": false }`

#### Delete a task
```
DELETE /api/{user_id}/tasks/{task_id}
```
- Deletes the specified task
- Returns 204 status on success

#### Toggle task completion
```
PATCH /api/{user_id}/tasks/{task_id}/complete
```
- Toggles the completion status of the task
- Returns the updated task with new completion status

## Database Setup

### 1. Run database migrations
```bash
# This will be implemented in the actual application
python -m backend.database.migrate
```

### 2. Verify database connection
The application automatically connects to the database using the DATABASE_URL environment variable.

## Testing

### Run unit tests
```bash
cd backend
pytest tests/
```

### Run integration tests
```bash
cd backend
pytest tests/test_api.py
```

## Example Usage

### 1. Get user's tasks (after obtaining JWT from frontend)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user123/tasks
```

### 2. Create a new task
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "Buy groceries", "description": "Milk, bread, eggs"}' \
     http://localhost:8000/api/user123/tasks
```

### 3. Update task completion status
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user123/tasks/task456/complete
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success for GET, PUT, PATCH requests
- 201: Success for POST requests (resource created)
- 204: Success for DELETE requests (no content to return)
- 400: Bad request (malformed request)
- 401: Unauthorized (missing or invalid JWT)
- 403: Forbidden (JWT user_id doesn't match path user_id)
- 404: Not found (resource doesn't exist)
- 422: Validation error (request body validation failed)
- 500: Internal server error

## Security Considerations

- JWT tokens are verified using the BETTER_AUTH_SECRET
- All requests must include a valid JWT in the Authorization header
- User ID in JWT must match the user_id in the API path
- Database queries are filtered by user_id to prevent unauthorized access
- No server-side sessions are maintained (stateless authentication)

## Troubleshooting

### Common Issues

1. **401 Unauthorized errors**
   - Verify that the JWT token is valid and not expired
   - Check that the Authorization header is properly formatted

2. **403 Forbidden errors**
   - Ensure that the user_id in the JWT matches the user_id in the API path
   - Verify that you're accessing tasks that belong to the authenticated user

3. **Database connection errors**
   - Verify that the DATABASE_URL is correctly configured
   - Check that the Neon database is accessible from your network

4. **Validation errors (422)**
   - Check that request bodies match the expected schema
   - Ensure required fields are provided and within length constraints