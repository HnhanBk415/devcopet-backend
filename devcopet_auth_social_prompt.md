# Devcopet Auth Feature Prompt for Claude Sonnet (Antigravity IDE)

## How to use
Paste the prompt below into Claude Sonnet inside Antigravity IDE.
This prompt is designed for the **Devcopet** project and covers:

- Local signup / login
- JWT auth
- Refresh token
- Logout
- Current user profile
- Social login:
  - GitHub
  - Google
  - Facebook
- Frontend integration for React
- NestJS backend implementation
- MongoDB / Mongoose data model
- Security and MVP-first architecture

---

## Prompt to paste

```text
You are a senior full-stack engineer and system architect.

Help me implement the COMPLETE AUTHENTICATION FEATURE for my project called Devcopet.

IMPORTANT:
- First analyze the current repository and existing auth/users-related files.
- Then propose a clean implementation plan.
- Then implement incrementally file by file.
- Do NOT rewrite the whole repository.
- Do NOT modify unrelated modules.
- Reuse the existing NestJS + TypeScript + Mongoose structure already present in the repo.
- Keep the solution practical for a student MVP, but architecturally clean and extensible.

==================================================
1. PROJECT CONTEXT
==================================================

Project name: Devcopet

Devcopet is a coding-learning platform with 3 main parts:
- Tutorial
- Game Roadmap
- Pet System

Current stack:
- Frontend: TypeScript, ReactJS, Tailwind
- Backend: TypeScript, NestJS, MongoDB Atlas, Postman
- Tooling: ESLint, Prettier, Husky pre-commit

I already have login and signup UI that includes:
- email/password local login
- signup
- social login buttons for:
  - GitHub
  - Google
  - Facebook

I want the backend and frontend auth logic to support these flows cleanly.

==================================================
2. AUTH FEATURE SCOPE
==================================================

I want the authentication feature to include:

## A. Local authentication
- Register with email + password
- Login with email + password
- Logout
- Get current authenticated user
- Password hashing
- DTO validation
- JWT access token
- Refresh token

## B. Social authentication
- GitHub login
- Google login
- Facebook login

## C. Auth state support for the rest of Devcopet
The user model must be compatible with:
- onboardingCompleted
- petProfileInitialized
- level
- exp
- coins
- future roadmap progress
- future pet personalization


I want a solution that is:
- clean
- secure enough
- understandable for a student team
- not over-engineered
- easy to maintain
- easy to extend later

If some parts should be phase 1 and some should be phase 2, clearly say so.

==================================================
4. WHAT I NEED YOU TO DO
==================================================

Please do the work in this order:

## PART 1 — REPO ANALYSIS
Analyze the current repository first and tell me:
1. Which auth-related files are already usable
2. Which files should be modified
3. Which files should be created
4. Which files are redundant / risky / outdated
5. What exact order should be used to implement auth safely

Do NOT code yet until analysis is done.



Also answer:
- where to store access token
- where to store refresh token
- cookie vs localStorage tradeoff
- what you recommend for this project

## PART 2 — DATA MODEL DESIGN
Design the auth-related user model and related data.

At minimum, the User schema should support:
- username
- email
- passwordHash
- role
- avatarUrl
- authProviders
- githubId
- googleId
- facebookId
- level
- exp
- coins
- onboardingCompleted
- petProfileInitialized

Decide whether refresh token should be:
- stored hashed inside User, or
- stored in a separate collection

Explain which choice is better for Devcopet MVP.
## PART 3 — AUTH ARCHITECTURE
Explain the full auth architecture for Devcopet:
- local register flow
- local login flow
- JWT access token flow
- refresh token flow
- logout flow
- GitHub login flow
- Google login flow
- Facebook login flow
- how frontend React should handle auth state 
## PART 4 — API DESIGN
Design all auth-related endpoints, including:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /users/me
- GET /auth/github
- GET /auth/github/callback
- GET /auth/google
- GET /auth/google/callback
- GET /auth/facebook
- GET /auth/facebook/callback

For each endpoint, specify:
- purpose
- request body / query / headers
- success response example
- error response example
- whether auth is required

## PART 5 — FILE STRUCTURE
Show the exact file structure to implement this feature in NestJS.

For example:
- src/modules/auth/auth.module.ts
- src/modules/auth/auth.controller.ts
- src/modules/auth/auth.service.ts
- src/modules/auth/dto/register.dto.ts
- src/modules/auth/dto/login.dto.ts
- src/modules/auth/dto/refresh-token.dto.ts
- src/modules/auth/guards/jwt-auth.guard.ts
- src/modules/auth/guards/github-auth.guard.ts
- src/modules/auth/guards/google-auth.guard.ts
- src/modules/auth/guards/facebook-auth.guard.ts
- src/modules/auth/strategies/jwt.strategy.ts
- src/modules/auth/strategies/github.strategy.ts
- src/modules/auth/strategies/google.strategy.ts
- src/modules/auth/strategies/facebook.strategy.ts
- src/modules/users/schemas/user.schema.ts
- src/modules/users/users.service.ts
- src/modules/users/users.controller.ts

Reuse current repo structure where possible.

## PART 6 — IMPLEMENTATION
Now write the actual code, file by file.

Requirements:
- Use TypeScript
- Use NestJS best practices
- Use Mongoose
- Use Passport strategies where appropriate
- Use:
  - @nestjs/passport
  - @nestjs/jwt
  - passport-jwt
  - passport-github2
  - passport-google-oauth20
  - passport-facebook
- Use DTO validation with class-validator
- Use bcrypt or bcryptjs for password hashing

### Local auth requirements
Register:
- normalize email
- check duplicate email
- hash password
- create user with default values:
  - role = student
  - level = 1
  - exp = 0
  - coins = 0
  - onboardingCompleted = false
  - petProfileInitialized = false
- never return passwordHash

Login:
- normalize email
- find by email
- compare password
- return:
  - accessToken
  - refreshToken
  - safe user profile

### Refresh token requirements
- implement refresh token route
- hash refresh token before saving if stored
- allow token rotation if practical
- logout should revoke refresh token

### users/me requirements
- protected by JWT guard
- must query DB again using userId from token
- return safe user profile

### Social login requirements
Implement GitHub, Google, and Facebook login with these rules:
- if social login email already exists:
  - link provider to the existing user
  - do not create duplicate account
- if no account exists:
  - create a new user with default Devcopet values
- if provider does not return email:
  - define a safe fallback strategy and explain it
- do not break local login accounts
- the same user may later have multiple auth providers linked

### Frontend callback requirements
After successful social login:
- backend should redirect to frontend with auth result
- frontend should receive tokens or an auth code in a safe way
- recommend the best practical SPA flow for Devcopet

## PART 7 — FRONTEND INTEGRATION
Show how React frontend should integrate with this auth system.

Include:
- register form flow
- login form flow
- save token flow
- refresh token handling
- logout flow
- fetch /users/me after login
- protected routes
- auth context / provider recommendation
- social login button flow for GitHub / Google / Facebook

If possible, provide minimal React example code.

## PART 8 — ENV VARIABLES
List all required .env variables and explain each one.

Examples:
- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_EXPIRES_IN
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GITHUB_CALLBACK_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL
- FACEBOOK_APP_ID
- FACEBOOK_APP_SECRET
- FACEBOOK_CALLBACK_URL
- FRONTEND_URL
- BACKEND_URL

## PART 9 — SECURITY BEST PRACTICES
Explain the security rules I should follow:
- never store plain password
- never return passwordHash
- hash refresh token if stored
- generic login error messages
- input validation
- CORS
- state parameter for OAuth if needed
- safe redirect handling
- account linking rules
- protecting me route
- avoiding duplicate users across providers

## PART 10 — IMPLEMENTATION ORDER
Give me a very practical step-by-step order:
1. inspect repo
2. clean user schema
3. implement local DTOs
4. implement local register/login
5. implement JWT strategy/guard
6. implement users/me
7. implement refresh token
8. test Postman
9. implement GitHub login
10. implement Google login
11. implement Facebook login
12. implement frontend auth integration
13. test end-to-end

==================================================
5. RULES / CONSTRAINTS
==================================================

- Do not rewrite the whole codebase
- Do not touch unrelated modules
- Do not break current module structure
- Keep explanations concise but clear
- Prefer real code over pseudo-code
- If a design tradeoff exists, explain it briefly
- Keep the solution realistic for a student MVP

==================================================
6. FINAL EXPECTATION
==================================================

At the end, I want to be able to:
- copy the code into the Devcopet repo
- run local register/login
- run JWT protected me route
- run refresh token flow
- add GitHub/Google/Facebook login properly
- connect it with React frontend
- keep the auth foundation clean for future onboarding, pet system, and progress tracking

Start now with PART 1 — REPO ANALYSIS only.
Do not code yet until the analysis and implementation plan are complete.
```

---

## Suggested follow-up prompts after Claude finishes analysis

### Follow-up 1 — Local auth only
```text
Now implement only local authentication:
- user schema cleanup
- register dto
- login dto
- auth service local register/login
- auth controller local routes
- jwt strategy
- jwt auth guard
- users/me
- validation pipe
- cors if needed

Do not implement social login yet.
Do not implement refresh token yet unless required for structure.
```

### Follow-up 2 — Refresh token
```text
Now implement refresh token and logout flow only.
Keep it practical for Devcopet MVP.
Use the existing local auth structure and avoid over-engineering.
```

### Follow-up 3 — GitHub login
```text
Now implement GitHub OAuth login only.
Reuse the existing auth structure.
Do not touch Google/Facebook yet.
```

### Follow-up 4 — Google login
```text
Now implement Google OAuth login only.
Reuse the existing auth structure.
Do not touch Facebook yet.
```

### Follow-up 5 — Facebook login
```text
Now implement Facebook OAuth login only.
Reuse the existing auth structure.
```

### Follow-up 6 — Frontend integration
```text
Now implement React frontend integration for:
- local login
- local register
- logout
- /users/me
- GitHub / Google / Facebook login buttons
- protected routes
- auth context
```

---

## Practical recommendation for Devcopet MVP
Best order:
1. Local register/login
2. JWT + me route
3. Refresh token
4. Google login
5. GitHub login
6. Facebook login

Reason:
- Google often has the cleanest student MVP flow
- GitHub is common for developer users
- Facebook usually has more friction and less priority for a coding-learning product
