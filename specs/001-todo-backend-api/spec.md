# Feature Specification: Todo Backend API

**Feature Branch**: `001-todo-backend-api`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Project: Phase II – Todo Full-Stack Web Application (Backend Only)

Target audience:
- Hackathon judges reviewing backend architecture, security, and correctness
- Developers evaluating FastAPI + JWT integration with a Next.js frontend

Focus:
- Building a secure, stateless REST API using FastAPI
- Implementing multi-user Todo task management with strict user isolation
- Verifying JWT tokens issued by Better Auth (frontend)
- Persisting task data in Neon Serverless PostgreSQL using SQLModel
- Ensuring seamless and correct integration with the Next.js frontend

Success criteria:
- All required REST API endpoints are implemented and functional
- Every endpoint is protected by JWT authentication
- JWT tokens issued by Better Auth are successfully verified
- Authenticated user identity is extracted from JWT payload
- User ID in JWT must match user_id in API path
- Each user can only access, create, update, or delete their own tasks
- Task data is persisted correctly in Neon PostgreSQL
- API responses return correct HTTP status codes and JSON schemas
- Backend aligns fully with the following specs:
  - @specs/api/rest-endpoints.md
  - @specs/features/task-crud.md
  - @specs/features/authentication.md
  - @specs/database/schema.md
- Backend integrates cleanly with frontend API client using:
  Authorization: Bearer <JWT>
- No manual coding; all implementation via Claude Code

Environment configuration:
- Backend must load configuration from environment variables:
  - DATABASE_URL=postgresql://neondb_owner:npg_WKt3Yy8suNkv@ep-withered-voice-a7pygs7k-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  - BETTER_AUTH_SECRET=PWaqdnA55xkCQBRUV7MwraRZ3n4RAY1v
  - BETTER_AUTH_URL=http://localhost:3000
- BETTER_AUTH_SECRET must be used to verify JWT signatures
- DATABASE_URL must be used for all database connections

API scope:
- GET    /api/{user_id}/tasks            → List all tasks for authenticated user
- POST   /api/{user_id}/tasks            → Create a new task
- GET    /api/{user_id}/tasks/{id}        → Get task details
- PUT    /api/{user_id}/tasks/{id}        → Update a task
- DELETE /api/{user_id}/tasks/{id}        → Delete a task
- PATCH  /api/{user_id}/tasks/{id}/complete → Toggle task completion

Authentication & security behavior:
- All endpoints require a valid JWT
- JWT must be extracted from:
  Authorization: Bearer <token>
- JWT signature must be verified using BETTER_AUTH_SECRET
- JWT payload must be decoded to extract:
  - user id
  - email (if present)
- If JWT is missing or invalid → return 401 Unauthorized
- If JWT user_id does not match path user_id → return 403 Forbidden
- Task ownership must be enforced at database query level
- Backend must remain stateless (no server-side sessions)

Constraints:
- Technology stack is fixed:
  - Python FastAPI
  - SQLModel ORM
  - Neon Serverless PostgreSQL
- All routes must be under /api
- Use Pydantic models for request and response validation
- Follow backend structure and conventions in /backend/CLAUDE.md
- Only Phase II features are allowed

Not building:
- Frontend UI or authentication pages
- Better Auth frontend logic (already handled by Next.js)
- AI chatbot or MCP tools (Phase III)
- Background workers, cron jobs, or caching layers
- WebSockets or real-time features
- Role-based access control beyond single-user ownership

Outcomes:
- Backend securely supports multiple authenticated users
- Data isolation is enforced for every request
- API integrates successfully with Next.js frontend
- Backend is production-ready, hackathon-ready, and Phase III–extensible"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Task Management (Priority: P1)

As an authenticated user, I want to securely manage my personal todo tasks through a REST API so that I can organize my work and personal activities with confidence that only I can access my data.

**Why this priority**: This is the core functionality of the application - without secure task management, the entire purpose of the application is lost. It provides the fundamental value proposition of the system.

**Independent Test**: Can be fully tested by authenticating with a JWT token, creating tasks, retrieving them, updating them, and deleting them. The system should enforce user isolation and return appropriate HTTP status codes for all operations.

**Acceptance Scenarios**:

1. **Given** a user has a valid JWT token, **When** they make a GET request to /api/{their_user_id}/tasks, **Then** they should receive a list of their own tasks with 200 OK status
2. **Given** a user has a valid JWT token, **When** they make a POST request to /api/{their_user_id}/tasks with valid task data, **Then** a new task should be created for that user with 201 Created status
3. **Given** a user has a valid JWT token, **When** they make a request to access tasks that belong to another user, **Then** they should receive 403 Forbidden status

---

### User Story 2 - JWT Token Authentication (Priority: P1)

As a system administrator, I want the API to validate JWT tokens issued by Better Auth so that unauthorized users cannot access or manipulate task data.

**Why this priority**: Security is paramount for any system handling user data. Without proper authentication, the system is vulnerable to unauthorized access and data breaches.

**Independent Test**: Can be fully tested by making API requests with valid JWT tokens, invalid tokens, missing tokens, and mismatched user IDs. The system should consistently enforce authentication and authorization rules.

**Acceptance Scenarios**:

1. **Given** a request has a valid JWT token with correct user ID, **When** the request is made to any endpoint, **Then** the request should be processed with 200 OK status
2. **Given** a request has no JWT token or an invalid JWT token, **When** the request is made to any endpoint, **Then** the request should be rejected with 401 Unauthorized status
3. **Given** a request has a valid JWT token but the user ID in the token doesn't match the user ID in the path, **When** the request is made, **Then** the request should be rejected with 403 Forbidden status

---

### User Story 3 - Task CRUD Operations (Priority: P2)

As a user, I want to be able to create, read, update, and delete my tasks through the API so that I can manage my todo list effectively.

**Why this priority**: This provides the complete set of operations that users need to manage their tasks effectively. Without full CRUD support, the application would be limited in functionality.

**Independent Test**: Can be fully tested by performing each CRUD operation separately and verifying that data is stored and retrieved correctly in the Neon PostgreSQL database.

**Acceptance Scenarios**:

1. **Given** a user has a valid JWT token and wants to create a task, **When** they make a POST request to /api/{their_user_id}/tasks with task data, **Then** the task should be created and returned with 201 Created status
2. **Given** a user has a valid JWT token and wants to update a task, **When** they make a PUT request to /api/{their_user_id}/tasks/{task_id} with updated data, **Then** the task should be updated and returned with 200 OK status
3. **Given** a user has a valid JWT token and wants to delete a task, **When** they make a DELETE request to /api/{their_user_id}/tasks/{task_id}, **Then** the task should be deleted with 204 No Content status

---

### User Story 4 - Task Completion Toggle (Priority: P3)

As a user, I want to be able to mark tasks as complete or incomplete with a single API call so that I can easily track my progress.

**Why this priority**: This provides a convenient way to update task status without requiring a full PUT request, improving the user experience for the common operation of toggling task completion status.

**Independent Test**: Can be fully tested by making PATCH requests to the completion endpoint and verifying that the task's completion status is toggled appropriately.

**Acceptance Scenarios**:

1. **Given** a user has a valid JWT token and has an incomplete task, **When** they make a PATCH request to /api/{their_user_id}/tasks/{task_id}/complete, **Then** the task should be marked as complete with 200 OK status
2. **Given** a user has a valid JWT token and has a complete task, **When** they make a PATCH request to /api/{their_user_id}/tasks/{task_id}/complete, **Then** the task should be marked as incomplete with 200 OK status

---

### Edge Cases

- What happens when a user attempts to access a task that doesn't exist? → Should return 404 Not Found
- How does system handle malformed JWT tokens? → Should return 401 Unauthorized
- What happens when a user attempts to create a task with invalid data? → Should return 422 Unprocessable Entity with validation errors
- How does system handle database connectivity issues? → Should return appropriate error responses (5xx status codes)
- What happens when a user attempts to access another user's tasks? → Should return 403 Forbidden

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide REST API endpoints for task CRUD operations under /api/{user_id}/tasks
- **FR-002**: System MUST authenticate all API requests using JWT tokens from Better Auth
- **FR-003**: System MUST verify JWT token signatures using the BETTER_AUTH_SECRET
- **FR-004**: System MUST extract user identity from JWT payload to enforce user isolation
- **FR-005**: System MUST validate that JWT user_id matches the user_id in the API path
- **FR-006**: System MUST enforce user ownership at the database query level
- **FR-007**: System MUST persist task data in Neon Serverless PostgreSQL using SQLModel
- **FR-008**: System MUST return appropriate HTTP status codes (200, 201, 204, 401, 403, 404, 422, 500)
- **FR-009**: System MUST validate request data using Pydantic models
- **FR-010**: System MUST provide PATCH endpoint to toggle task completion status
- **FR-011**: System MUST return JSON responses that conform to defined schemas
- **FR-012**: System MUST be stateless with no server-side session storage
- **FR-013**: System MUST load configuration from environment variables (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)

### Key Entities

- **Task**: Represents a user's todo item with attributes like title, description, completion status, and timestamps
- **User**: Represents an authenticated user identified by user_id extracted from JWT token
- **JWT Token**: Contains user identity information used for authentication and authorization
- **API Endpoint**: RESTful endpoints that follow the pattern /api/{user_id}/tasks with appropriate HTTP methods

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All required REST API endpoints are implemented and return correct HTTP status codes (200, 201, 204, 401, 403, 404, 422, 500)
- **SC-002**: JWT authentication successfully verifies tokens issued by Better Auth with 99% success rate for valid tokens
- **SC-003**: User isolation is enforced correctly - users can only access their own tasks (0% cross-user data access)
- **SC-004**: Task CRUD operations complete within 1 second 95% of the time under normal load conditions
- **SC-005**: API integrates seamlessly with Next.js frontend using Authorization: Bearer <JWT> header format
- **SC-006**: System handles database persistence correctly with 99.9% successful save/update operations
- **SC-007**: All API responses conform to documented JSON schemas with proper validation
- **SC-008**: Backend remains stateless and scales horizontally without session affinity requirements