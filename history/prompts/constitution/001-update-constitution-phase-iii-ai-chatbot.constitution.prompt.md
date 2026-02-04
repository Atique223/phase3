---
id: 001
title: Update Constitution Phase III AI Chatbot
stage: constitution
date: 2026-01-31
surface: agent
model: claude-sonnet-4-5
feature: none
branch: not-a-git-repo
user: Atique223
command: /sp.constitution
labels: ["constitution", "phase-iii", "ai-agents", "mcp", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
  - .specify/templates/spec-template.md
  - .specify/templates/tasks-template.md
tests:
  - N/A (documentation update)
---

## Prompt

```text
/sp.constitution

Project: Phase III — Todo AI Chatbot (MCP + Agents)

Objective:
Add an AI-powered, natural-language chatbot to manage todos using a stateless, tool-driven agent architecture based on MCP.

Core principles:
- Tool-first AI: All task changes occur only via MCP tools
- Stateless execution: No server memory beyond database state
- Agentic correctness: Agents act strictly within spec-defined behavior
- Separation of concerns: Agent, tools, UI, and storage are isolated
- Recoverability: Conversations resume after server restarts

Key standards:
- Workflow: Spec → Plan → Tasks → Implement (Claude Code only)
- AI framework: OpenAI Agents SDK
- MCP server: Official MCP SDK
- Backend: FastAPI + SQLModel
- Database: Neon PostgreSQL
- Frontend: OpenAI ChatKit
- Auth: Better Auth (JWT)

Behavior & architecture:
- POST /api/{user_id}/chat endpoint
- Conversation + message state persisted in DB
- Agent uses MCP tools for all task operations
- MCP tools are stateless and user-scoped
- JWT required for all requests

Constraints:
- No manual coding
- No agent-side hidden memory
- No frontend DB access
- No cross-user data access
- Config via environment variables only

Success criteria:
- Users manage todos via natural language
- Agent correctly selects MCP tools
- All task changes persist correctly
- Conversations survive server restarts
- System behavior fully traceable to specs
```

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR version bump) to reflect Phase III architectural changes:

**New Core Principles Added:**
- Tool-first AI: All data changes via MCP tools only
- Stateless execution: No server memory beyond database
- Agentic correctness: Agent behavior traceable to specs
- Recoverability: Conversations resume after restarts

**Retained Principles (strengthened):**
- Spec-driven development
- Multi-user data isolation (now includes MCP tool scoping)
- Separation of concerns (expanded to agent/tools/UI/storage layers)
- Security first (JWT for all endpoints)
- Implementation automation

**Key Standards Updated:**
- AI Framework: OpenAI Agents SDK
- MCP Server: Official MCP SDK
- Agent Behavior: Tool-only data access, stateless operation
- Conversation Persistence: Database-backed state for recovery

**Template Updates:**
- plan-template.md: Added AI/Agent architecture section and constitution checks
- spec-template.md: Added AI/Agent requirements section (8 new requirement types)
- tasks-template.md: Added AI/Agent infrastructure tasks in foundational phase

**Version Rationale:**
MAJOR bump (1.0.0 → 2.0.0) due to fundamental architectural changes introducing AI agent layer, MCP tools, and stateless execution model. These changes are backward incompatible with Phase II's direct CRUD approach.

## Outcome

- ✅ Impact: Constitution successfully updated to v2.0.0 with 4 new core principles and comprehensive AI/agent standards
- 🧪 Tests: N/A (documentation update)
- 📁 Files: 4 files updated (constitution + 3 templates)
- 🔁 Next prompts: /sp.specify to create Phase III feature spec, /sp.plan to design implementation
- 🧠 Reflection: MAJOR version bump appropriate due to architectural paradigm shift from direct CRUD to agent-mediated tool-based operations

## Evaluation notes (flywheel)

- Failure modes observed: None - all templates updated successfully with consistent AI/agent guidance
- Graders run and results (PASS/FAIL): Manual validation PASS - no unresolved placeholders, all dates ISO format, version semantics correct
- Prompt variant (if applicable): N/A (standard constitution update)
- Next experiment (smallest change to try): Monitor whether AI/Agent sections in templates provide sufficient guidance during /sp.plan and /sp.tasks execution
