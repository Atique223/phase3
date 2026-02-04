---
name: backend-routing-and-db
description: Generate backend routes, handle HTTP requests/responses, and connect to databases. Use for building APIs and server-side logic.
---

# Backend Skill – Routes, Requests & Database

## Instructions

1. **Project setup**
   - Initialize backend framework (Express, Fastify, NestJS, etc.)
   - Configure environment variables
   - Set up project structure (routes, controllers, services)

2. **Routing**
   - Define RESTful routes (GET, POST, PUT, DELETE)
   - Use route grouping and versioning
   - Apply middleware for auth, logging, and validation

3. **Request & Response Handling**
   - Parse request body, params, and query strings
   - Validate incoming data
   - Return structured JSON responses
   - Handle errors with proper HTTP status codes

4. **Database Connection**
   - Configure database client/ORM (Prisma, Sequelize, TypeORM, Mongoose)
   - Establish and reuse DB connections
   - Perform CRUD operations
   - Handle connection errors and timeouts

5. **Security & Performance**
   - Sanitize inputs
   - Use async/await for non-blocking operations
   - Implement pagination and filtering
   - Secure sensitive data

## Best Practices
- Follow REST or GraphQL conventions
- Keep controllers thin, move logic to services
- Centralize error handling
- Use environment variables for secrets
- Write reusable and testable code

## Example Structure
```js
// routes/user.routes.js
import express from "express";
import { getUsers, createUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);

export default router;
