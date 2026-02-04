---
id: 2
title: create-impl-plan
stage: plan
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-backend-api
branch: 001-todo-backend-api
user: claude
command: /sp.plan
labels: [planning, architecture, backend, api, todo]
links:
  spec: specs/001-todo-backend-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-todo-backend-api/plan.md
 - specs/001-todo-backend-api/research.md
 - specs/001-todo-backend-api/data-model.md
 - specs/001-todo-backend-api/quickstart.md
 - specs/001-todo-backend-api/contracts/openapi.yaml
 - CLAUDE.md
tests:
 - constitution check passed
 - all planning artifacts created
---

## Prompt

/sp.plan

Project: Phase II – Todo Full-Stack Web Application (Backend Only)

Goal:
Design and implement a secure, stateless FastAPI backend that supports multi-user Todo management, verifies JWTs issued by Better Auth, persists data in Neon PostgreSQL, and integrates seamlessly with a Next.js frontend.

Architecture plan:

1. Application setup
- Initialize FastAPI app (`main.py`)
- Load environment variables (DATABASE_URL, BETTER_AUTH_SECRET)
- Configure CORS to allow Next.js frontend
- Register API routers under `/api`

2. Database layer
- Configure Neon PostgreSQL connection using SQLModel
- Define Task model aligned with `@specs/database/schema.md`
- Ensure indexes on `user_id` and `completed`
- Create database session dependency

3. Authentication & security
- Implement JWT verification utility:
  - Extract token from `Authorization: Bearer <token>`
  - Verify signature using BETTER_AUTH_SECRET
  - Decode payload and extract `user_id`
- Add FastAPI dependency/middleware for authentication
- Enforce:
  - 401 if token missing/invalid
  - 403 if JWT user_id ≠ path user_id

4. API route implementation
- Implement REST endpoints:
  - GET    /api/{user_id}/tasks
  - POST   /api/{user_id}/tasks
  - GET    /api/{user_id}/tasks/{id}
  - PUT    /api/{user_id}/tasks/{id}
  - DELETE /api/{user_id}/tasks/{id}
  - PATCH  /api/{user_id}/tasks/{id}/complete
- Filter all database queries by authenticated `user_id`
- Use Pydantic schemas for request/response models

5. Error handling & validation
- Standardize error responses with HTTPException
- Validate task ownership on every operation
- Return correct HTTP status codes (200, 201, 401, 403, 404)

6. Frontend integration readiness
- Ensure all endpoints accept JWT from frontend
- Match API behavior defined in `@specs/api/rest-endpoints.md`
- Keep backend stateless (no sessions, no cookies)

7. Verification & readiness
- Manually verify API flow:
  Frontend login → JWT → API request → JWT verification → DB query
- Confirm user isolation and data persistence
- Ensure backend is Phase III extensible (no breaking assumptions)

Deliverable:
A production-ready FastAPI backend that fully satisfies Phase II requirements, securely integrates with Better Auth, and supports the Next.js frontend without modification.

## Response snapshot

Successfully completed the implementation plan for the Todo Backend API. Created all required planning artifacts:

1. Updated plan.md with technical context, constitution check, and project structure
2. Created research.md with technology decisions and rationale
3. Created data-model.md defining the Task entity and relationships
4. Created quickstart.md with setup and usage instructions
5. Created OpenAPI contract in contracts/openapi.yaml
6. Updated agent context in CLAUDE.md with new technology information

The plan follows the architecture outlined in the user's request, utilizing FastAPI, SQLModel, Neon PostgreSQL, and JWT authentication. All constitution checks passed, ensuring compliance with the project's core principles. The backend structure separates concerns into logical modules for maintainability and scalability.

## Outcome

- ✅ Impact: Complete implementation plan created with all required artifacts
- 🧪 Tests: Constitution check passed, all planning artifacts validated
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/openapi.yaml, CLAUDE.md updated
- 🔁 Next prompts: Ready for /sp.tasks to break plan into implementation tasks
- 🧠 Reflection: Plan comprehensively covers all aspects of the backend implementation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All constitution checks passed
- Prompt variant (if applicable): Standard /sp.plan
- Next experiment (smallest change to try): Proceed to task generation with /sp.tasks