<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 2.0.0
Modified principles:
  - "Spec-driven development" → retained with expanded agentic workflow
  - "Multi-user data isolation" → retained and strengthened
  - "Full-stack separation of concerns" → expanded to include AI agent and MCP layers
  - "Security first" → retained with same JWT requirements
  - "Implementation automation" → retained
Added sections:
  - Tool-first AI (new core principle)
  - Stateless execution (new core principle)
  - Agentic correctness (new core principle)
  - Recoverability (new core principle)
  - MCP architecture standards
  - AI agent behavior constraints
Removed sections:
  - Phase II specific CRUD-only feature constraints
Templates requiring updates:
  - ✅ Updated - .specify/memory/constitution.md
  - ✅ Updated - .specify/templates/plan-template.md (added AI/Agent architecture sections and constitution checks)
  - ✅ Updated - .specify/templates/spec-template.md (added AI/Agent requirements section)
  - ✅ Updated - .specify/templates/tasks-template.md (added AI/Agent infrastructure tasks)
Follow-up TODOs:
  - Update plan template to include MCP tool design and agent behavior specification
  - Update spec template to include natural language interaction patterns
  - Update tasks template to include agent testing and MCP tool validation tasks
-->

# Phase III – Todo AI Chatbot (MCP + Agents) Constitution

## Core Principles

### Tool-first AI
All task changes MUST occur exclusively via MCP tools. The AI agent has no direct database access and cannot modify state outside the tool interface. This ensures traceability, testability, and separation of concerns between intelligence and execution.

**Rationale**: Tool-based architecture enables clear boundaries, makes agent behavior auditable, and allows independent testing of tools and agent logic.

### Stateless execution
No server memory beyond database state. The agent maintains no session state, conversation history, or user context outside what is persisted in the database. Every request is self-contained with context loaded from storage.

**Rationale**: Stateless design ensures recoverability after restarts, enables horizontal scaling, and prevents hidden state bugs.

### Agentic correctness
Agents act strictly within spec-defined behavior. All agent actions must be traceable to specifications, with no emergent or undefined behaviors. Tool selection and parameter passing must follow documented contracts.

**Rationale**: Predictable agent behavior is critical for production systems. Spec-driven constraints prevent AI unpredictability from affecting user data.

### Separation of concerns
Agent, tools, UI, and storage are isolated layers with defined interfaces. The agent layer handles natural language understanding and tool orchestration. MCP tools handle all data operations. The UI layer manages presentation. The database layer provides persistence.

**Rationale**: Clear separation enables independent development, testing, and replacement of components without cascading changes.

### Recoverability
Conversations resume correctly after server restarts. All conversation state and message history must persist in the database. No in-memory state required for continuity.

**Rationale**: Production systems must survive restarts, deployments, and failures without losing user context or conversation history.

### Spec-driven development
All features implemented strictly according to Spec-Kit Plus specifications. The workflow is: Write Spec → Generate Plan → Break into Tasks → Implement via Claude Code.

**Rationale**: Specifications provide single source of truth, enable review before implementation, and ensure alignment between intent and execution.

### Multi-user data isolation
All tasks and conversations must be scoped per authenticated user using JWT. No cross-user data access permitted. MCP tools are user-scoped and enforce isolation at the tool level.

**Rationale**: Multi-tenant security requires strict isolation. User-scoped tools prevent accidental or malicious cross-user access.

### Security first
JWT-based authentication must be enforced for all API endpoints, with proper error handling. All requests without valid JWT must return 401 Unauthorized. Agent operations inherit user context from JWT claims.

**Rationale**: Authentication is the foundation of multi-user security. JWT provides stateless, verifiable identity for both API and agent operations.

### Implementation automation
Implementation must be fully automated via Claude Code; no manual coding allowed. All code generation follows specs, plans, and tasks without human intervention in the coding process.

**Rationale**: Automated implementation ensures consistency, reduces human error, and maintains traceability from spec to code.

## Key Standards

**AI Framework**: OpenAI Agents SDK for agent orchestration, tool calling, and conversation management.

**MCP Server**: Official MCP SDK for tool definition, registration, and execution. All tools are stateless and user-scoped.

**Backend**: FastAPI with SQLModel ORM, Neon Serverless PostgreSQL. POST /api/{user_id}/chat endpoint handles all agent interactions.

**Database**: Neon PostgreSQL stores tasks, conversations, and messages. Conversation state persisted to enable recovery after restarts.

**Frontend**: OpenAI ChatKit for chat UI. No direct database access from frontend; all operations via backend API.

**Authentication**: Better Auth issues JWT tokens. Backend validates JWT and extracts user_id for all operations.

**Configuration**: All secrets and configuration via environment variables only. No hardcoded credentials or API keys.

**MCP Tools**: Stateless, user-scoped tools for task operations (create, read, update, delete, list, filter). Tools receive user_id from agent context.

**Agent Behavior**: Agent uses MCP tools for all task operations. No direct database queries. No hidden memory or state. Tool selection based on user intent parsed from natural language.

## Development Workflow

**Phase III Feature Set**: Natural language todo management via AI chatbot. Users interact through conversational interface. Agent interprets intent and selects appropriate MCP tools. All task changes persist correctly. Conversations survive server restarts.

**API Contract**: POST /api/{user_id}/chat accepts message and conversation_id. Returns agent response and updated conversation state. JWT required in Authorization header.

**Tool Architecture**: MCP tools registered with agent at startup. Tools are pure functions: (user_id, parameters) → result. No side effects outside database operations.

**Conversation Persistence**: Each message stored with conversation_id, user_id, role (user/assistant), content, and timestamp. Agent loads conversation history from database before processing new messages.

**Error Handling**: Invalid JWT returns 401. Missing user_id returns 400. Tool execution errors returned to agent for graceful handling. Agent errors logged and returned as user-friendly messages.

**Testing Strategy**: Unit tests for MCP tools. Integration tests for agent + tools. End-to-end tests for API endpoint. Conversation recovery tests for restart scenarios.

## Governance

**Acceptance Criteria**:
- Users can manage todos via natural language
- Agent correctly selects MCP tools based on intent
- All task changes persist correctly in database
- Conversations resume correctly after server restarts
- System behavior fully traceable to specs
- All API endpoints require valid JWT
- No cross-user data access possible
- No manual coding performed; all features via Claude Code

**Compliance Requirements**:
- All code changes reference relevant specs
- All architectural decisions documented in ADRs
- All significant user interactions recorded in PHRs
- Templates kept in sync with constitution changes
- Version control follows semantic versioning

**Amendment Procedure**:
- Constitution changes require explicit user approval
- Version bump follows semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Backward incompatible principle changes
- MINOR: New principles or expanded guidance
- PATCH: Clarifications, wording fixes, non-semantic changes
- All amendments propagated to dependent templates
- Sync impact report generated for each amendment

**Review Cadence**:
- Constitution reviewed at phase boundaries
- Ad-hoc reviews when architectural decisions conflict with principles
- Template consistency checks after each amendment

**Version**: 2.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-31
