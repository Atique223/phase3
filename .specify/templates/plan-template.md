# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

**AI/Agent Architecture** *(if feature involves AI agents)*:
**Agent Framework**: [e.g., OpenAI Agents SDK, LangChain, custom or N/A]
**MCP Server**: [e.g., Official MCP SDK, custom implementation or N/A]
**Tool Architecture**: [e.g., Stateless user-scoped tools, function calling or N/A]
**State Management**: [e.g., Database-persisted conversations, stateless execution or N/A]
**Agent Constraints**: [e.g., Tool-only data access, no direct DB queries or N/A]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Core Principles Compliance**:
- [ ] **Tool-first AI** *(if AI feature)*: All data changes via MCP tools only, no direct DB access from agent
- [ ] **Stateless execution** *(if AI feature)*: No server memory beyond database, conversation state persisted
- [ ] **Agentic correctness** *(if AI feature)*: Agent behavior traceable to specs, no emergent behaviors
- [ ] **Separation of concerns**: Clear layer boundaries (agent/tools/UI/storage or frontend/backend)
- [ ] **Recoverability** *(if AI feature)*: Conversations resume after restarts via persisted state
- [ ] **Spec-driven development**: Feature follows Spec → Plan → Tasks → Implement workflow
- [ ] **Multi-user data isolation**: All operations scoped per authenticated user via JWT
- [ ] **Security first**: JWT authentication enforced for all API endpoints
- [ ] **Implementation automation**: No manual coding, all via Claude Code

**Standards Compliance**:
- [ ] Correct framework versions (e.g., OpenAI Agents SDK, FastAPI, Next.js)
- [ ] MCP tools are stateless and user-scoped *(if AI feature)*
- [ ] Configuration via environment variables only
- [ ] Database schema supports multi-user isolation
- [ ] Testing strategy includes unit, integration, and E2E tests
- [ ] Conversation recovery tests included *(if AI feature)*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
