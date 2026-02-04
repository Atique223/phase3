---
name: database-schema-skill
description: Design and manage database schemas, tables, and migrations with best practices. Use for backend and data-driven applications.
---

# Database Schema & Migrations Skill

## Instructions

1. **Schema Design**
   - Identify core entities and relationships
   - Normalize data to reduce redundancy
   - Choose appropriate data types
   - Define primary and foreign keys

2. **Table Creation**
   - Use clear, consistent naming conventions
   - Add indexes for frequently queried columns
   - Enforce constraints (NOT NULL, UNIQUE, CHECK)
   - Include timestamps where applicable

3. **Migrations**
   - Version-control all schema changes
   - Make migrations reversible (up/down)
   - Apply small, incremental changes
   - Test migrations in staging before production

4. **Relationships**
   - One-to-one, one-to-many, many-to-many
   - Use junction tables for many-to-many
   - Enforce referential integrity
   - Decide on cascade rules carefully

## Best Practices
- Design schema before writing application code
- Avoid over-indexing
- Keep migrations atomic and descriptive
- Never edit old migrations in shared environments
- Document schema decisions

## Example Structure

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
