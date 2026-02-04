---
id: 1
title: create-todo-backend-api-spec
stage: spec
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-backend-api
branch: 001-todo-backend-api
user: claude
command: /sp.specify
labels: [specification, backend, api, todo, authentication]
links:
  spec: specs/001-todo-backend-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-todo-backend-api/spec.md
 - specs/001-todo-backend-api/checklists/requirements.md
tests:
 - spec validation checklist completed
---

## Prompt

/sp.specify

Project: Phase II – Todo Full-Stack Web Application (Backend Only)

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
- Backend is production-ready, hackathon-ready, and Phase III–extensible

## Response snapshot

Successfully created the Todo Backend API specification following the template structure. The specification includes:

- User Scenarios & Testing with 4 prioritized user stories covering secure task management, JWT authentication, CRUD operations, and task completion toggle
- Functional Requirements with 13 specific requirements covering API endpoints, authentication, data persistence, and validation
- Key Entities including Task, User, JWT Token, and API Endpoint definitions
- Success Criteria with 8 measurable outcomes covering API functionality, authentication success rate, user isolation, performance, and integration

Also created a specification quality checklist at specs/001-todo-backend-api/checklists/requirements.md that validates all requirements have been met.

The specification is complete, follows the required template structure, and is ready for the planning phase.

## Outcome

- ✅ Impact: Created comprehensive spec for Todo Backend API with authentication and task management
- 🧪 Tests: Spec validation checklist completed successfully
- 📁 Files: specs/001-todo-backend-api/spec.md and specs/001-todo-backend-api/checklists/requirements.md created
- 🔁 Next prompts: Ready for /sp.plan to create implementation plan
- 🧠 Reflection: Spec follows template structure and addresses all requirements from user description

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All validation items completed
- Prompt variant (if applicable): Standard /sp.specify
- Next experiment (smallest change to try): Proceed to planning phase with /sp.plan