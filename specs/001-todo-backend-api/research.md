# Research: Todo Backend API

## Overview
This research document covers the technical decisions and investigations required to implement the secure, stateless FastAPI backend for multi-user Todo management with JWT authentication and Neon PostgreSQL persistence.

## Technology Stack Decisions

### Decision: FastAPI Framework
**Rationale**: FastAPI provides excellent performance, automatic API documentation (Swagger/OpenAPI), built-in validation with Pydantic, and strong async support. It's ideal for building secure APIs with minimal boilerplate code.

**Alternatives considered**:
- Flask: More manual setup required, less automatic validation
- Django: Overkill for a simple API backend, more complex configuration
- Express.js: Would require switching to Node.js ecosystem

### Decision: SQLModel ORM
**Rationale**: SQLModel combines SQLAlchemy's power with Pydantic's validation capabilities, allowing for shared models between API schemas and database models. It's developed by the same creator as FastAPI, ensuring good compatibility.

**Alternatives considered**:
- Pure SQLAlchemy: More verbose, separate validation layer needed
- Tortoise ORM: Async-native but less mature than SQLModel
- Peewee: Simpler but lacks advanced features needed for this project

### Decision: JWT Authentication with python-jose
**Rationale**: Better Auth issues JWT tokens that need to be verified using the same secret key. python-jose is the recommended library for JWT operations in Python and integrates well with FastAPI dependencies.

**Alternatives considered**:
- PyJWT: Lower-level, more manual implementation required
- Authlib: More complex for simple JWT verification
- FastAPI's built-in OAuth2: Doesn't handle Better Auth JWT tokens

## Database Design Considerations

### Decision: Neon Serverless PostgreSQL
**Rationale**: Neon provides serverless PostgreSQL with auto-scaling, branching, and improved performance. It's designed for modern applications and integrates well with the Python ecosystem.

**Alternatives considered**:
- Traditional PostgreSQL: Requires more infrastructure management
- SQLite: Not suitable for multi-user applications
- MongoDB: Would require different ORM and doesn't fit the relational model of tasks

### Decision: Task Model Structure
**Rationale**: The Task model needs to include user_id for proper ownership, timestamps for tracking, and fields for task details. Proper indexing on user_id and completion status ensures efficient queries.

**Fields identified**:
- id: Primary key
- user_id: Foreign key for user ownership
- title: Task title (required)
- description: Task description (optional)
- completed: Boolean indicating completion status
- created_at: Timestamp
- updated_at: Timestamp

## Security Implementation

### Decision: JWT Verification in Dependency
**Rationale**: Using FastAPI dependencies for JWT verification ensures that authentication is handled consistently across all endpoints. The dependency can extract user_id from the token and validate it against the path parameter.

**Implementation approach**:
- Extract token from Authorization header
- Verify signature using BETTER_AUTH_SECRET
- Decode payload and extract user_id
- Compare with path user_id to enforce ownership
- Raise HTTPException for invalid/missing tokens

### Decision: Database-Level User Isolation
**Rationale**: Filtering all queries by user_id at the database level provides an additional security layer beyond API-level checks. This prevents accidental data exposure even if API-level validation fails.

## Environment Configuration

### Decision: Configuration via Environment Variables
**Rationale**: Storing sensitive information like BETTER_AUTH_SECRET and DATABASE_URL in environment variables keeps secrets out of code and allows for different configurations per environment (dev, staging, prod).

**Variables required**:
- DATABASE_URL: PostgreSQL connection string
- BETTER_AUTH_SECRET: Secret key for JWT verification
- BETTER_AUTH_URL: Base URL for Better Auth

## Error Handling Strategy

### Decision: Standard HTTP Status Codes
**Rationale**: Using standard HTTP status codes ensures compatibility with frontend clients and follows REST conventions. Proper error responses help with debugging and user experience.

**Codes to implement**:
- 200 OK: Successful GET, PUT, PATCH requests
- 201 Created: Successful POST request
- 204 No Content: Successful DELETE request
- 400 Bad Request: Invalid request format
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: JWT user_id doesn't match path user_id
- 404 Not Found: Resource doesn't exist
- 422 Unprocessable Entity: Validation errors
- 500 Internal Server Error: Unexpected errors

## API Endpoint Design

### Decision: RESTful URL Structure with User Scoping
**Rationale**: The URL pattern `/api/{user_id}/tasks` makes user ownership explicit in the API design. This ensures that all operations are scoped to the correct user and makes the API self-documenting.

**Endpoints to implement**:
- GET /api/{user_id}/tasks: List user's tasks
- POST /api/{user_id}/tasks: Create new task for user
- GET /api/{user_id}/tasks/{id}: Get specific task
- PUT /api/{user_id}/tasks/{id}: Update specific task
- DELETE /api/{user_id}/tasks/{id}: Delete specific task
- PATCH /api/{user_id}/tasks/{id}/complete: Toggle completion status