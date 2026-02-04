# Data Model: Todo Backend API

## Overview
This document defines the data structures and relationships for the Todo Backend API, focusing on the Task entity and its attributes required for multi-user functionality with proper ownership and authentication.

## Task Entity

### Attributes
- **id** (UUID/String, Primary Key)
  - Unique identifier for each task
  - Auto-generated upon creation
  - Immutable after creation

- **user_id** (String, Required, Indexed)
  - The ID of the user who owns this task
  - Extracted from JWT token during authentication
  - Used for enforcing user isolation at database level
  - Foreign key reference to Better Auth user ID

- **title** (String, Required, Max 255 chars)
  - The main title/description of the task
  - Cannot be empty
  - Displayed in task lists

- **description** (String, Optional, Max 1000 chars)
  - Detailed description of the task
  - Can be null or empty
  - Used for additional context

- **completed** (Boolean, Required, Default: false, Indexed)
  - Indicates whether the task is completed
  - Default value is false (incomplete)
  - Used for filtering and displaying task status

- **created_at** (DateTime, Required, Indexed)
  - Timestamp when the task was created
  - Auto-set to current time on creation
  - Used for ordering and historical tracking

- **updated_at** (DateTime, Required, Indexed)
  - Timestamp when the task was last modified
  - Auto-updated on every modification
  - Used for tracking changes and ordering

### Relationships
- **Owner Relationship**: Each task belongs to exactly one user (identified by user_id)
- **User Tasks Collection**: Each user has many tasks (zero to many)

### Validation Rules
- **Required Fields**: title must be provided and non-empty
- **Length Constraints**:
  - title: 1-255 characters
  - description: 0-1000 characters
- **Data Type Validation**: All fields must match their specified types
- **Ownership Enforcement**: user_id in JWT must match the task's user_id for all operations

### Indexes
- **Primary Index**: id (unique)
- **User Access Index**: user_id (for efficient user-specific queries)
- **Status Filter Index**: completed (for efficient completed/incomplete filtering)
- **Temporal Index**: created_at (for chronological ordering)

## User Identity Model (Implicit)

### JWT Payload Attributes
- **user_id** (String, Required)
  - Extracted from JWT claims
  - Used to identify the authenticated user
  - Must match the user_id in the API path

- **email** (String, Optional)
  - May be included in JWT claims
  - Not used for core functionality but available for logging/augmentation

## State Transitions

### Task Completion State
- **Initial State**: completed = false
- **Transition 1**: incomplete → complete (via PATCH /complete endpoint)
- **Transition 2**: complete → incomplete (via PATCH /complete endpoint)

### Task Lifecycle
- **Creation**: New task with completed = false
- **Modification**: Update title, description, or toggle completion status
- **Deletion**: Permanent removal from database
- **Retrieval**: Read operations filtered by user_id

## Business Rules

### Ownership Enforcement
- Users can only create tasks with their own user_id
- Users can only read tasks that belong to their user_id
- Users can only update tasks that belong to their user_id
- Users can only delete tasks that belong to their user_id
- Cross-user access attempts result in 403 Forbidden

### Data Integrity
- Tasks cannot be created without a valid user_id
- Task titles cannot be empty
- Task IDs are immutable after creation
- Timestamps are automatically managed by the system

### Performance Considerations
- Queries are always filtered by user_id for optimal performance
- Indexes support common query patterns (by user, by completion status, by creation time)
- Soft deletes are not implemented; hard deletes are used for simplicity