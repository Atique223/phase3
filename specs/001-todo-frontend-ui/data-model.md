# Data Model: Todo Frontend UI

## User Entity
- **id**: string - Unique identifier for the user
- **email**: string - User's email address for authentication
- **name**: string - User's display name (optional)
- **createdAt**: Date - Account creation timestamp
- **updatedAt**: Date - Last account update timestamp

**Relationships**:
- One-to-many with Task entities (a user can have multiple tasks)

## Task Entity
- **id**: string - Unique identifier for the task
- **title**: string - Task title/description (required)
- **description**: string - Detailed task description (optional)
- **completed**: boolean - Completion status (default: false)
- **createdAt**: Date - Task creation timestamp
- **updatedAt**: Date - Last task update timestamp
- **userId**: string - Foreign key to User entity (for multi-user isolation)

**Validation rules**:
- Title must be between 1-255 characters
- Description can be up to 1000 characters
- Completed status is boolean (true/false)

**State transitions**:
- New task: completed = false
- Task completion: completed = true
- Task reversion: completed = false

## API Response Structures

### Authentication Response
```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string; // JWT token
}
```

### Task Response
```typescript
interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  userId: string;
}
```

### Task List Response
```typescript
interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  page: number;
  limit: number;
}
```

### Error Response
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
}
```