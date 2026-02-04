---

name: auth-skill
description: Implement secure authentication systems including signup, signin, password hashing, JWT-based sessions, and Better Auth integration.
-------------------------------------------------------------------------------------------------------------------------------------------------

# Authentication Skill

## Scope

This skill focuses on building secure, production-ready authentication flows for modern web applications.

Covers:

* User signup & signin
* Secure password storage
* Token-based authentication
* Integration with Better Auth

## Instructions

1. **User Signup**

   * Validate email and password
   * Hash passwords before storage
   * Prevent duplicate accounts
   * Return safe, minimal user data

2. **User Signin**

   * Verify credentials securely
   * Compare hashed passwords
   * Handle invalid attempts gracefully
   * Issue authentication tokens on success

3. **Password Hashing**

   * Use industry-standard hashing (bcrypt, argon2, or equivalent)
   * Apply proper salt rounds
   * Never store plaintext passwords

4. **JWT Tokens**

   * Generate signed JWTs
   * Include minimal claims (userId, role)
   * Set expiration and refresh logic
   * Validate tokens on protected routes

5. **Better Auth Integration**

   * Configure Better Auth providers
   * Use Better Auth for session handling
   * Support OAuth and credentials-based auth
   * Sync Better Auth users with database

## Security Best Practices

* Enforce strong password rules
* Rate-limit auth endpoints
* Use HTTPS only
* Store secrets in environment variables
* Rotate JWT secrets periodically
* Implement logout & token invalidation

## Example Flow

```ts
// Signup flow
POST /auth/signup
→ validate input
→ hash password
→ store user
→ return success response
```

```ts
// Signin flow
POST /auth/signin
→ verify credentials
→ issue JWT
→ return token
```

## Output Expectations

* Clean, readable auth logic
* Framework-agnostic where possible
* Secure-by-default implementations
* Easy to extend with roles & permissions

## Common Use Cases

* SaaS applications
* Dashboards
* APIs with protected routes
* Full-stack web apps

## Anti-Patterns to Avoid

* Storing plaintext passwords
* Long-lived JWTs without rotation
* Overloading JWT payloads
* Leaking auth errors with sensitive detail

## Success Criteria

* Users can securely sign up and sign in
* Tokens correctly protect routes
* Passwords are safely hashed
* Better Auth is correctly configured and integrated
