# CLAUDE.md - Roadmap-Nextjs-Backend

This file provides context for AI code generation models working on this project.

---

## Project Overview

**App Name:** Roadmap-Nextjs-Backend  
**Framework:** Next.js (App Router)  
**Database:** PostgreSQL  
**Authentication:** better-auth (API key-based)

A feature voting system that allows users to vote for product roadmap features via a RESTful API. Users authenticate with API keys and are identified by a UUID to prevent double-voting.

---

## Development Phases

### Phase 1: Backend API
- RESTful API for feature voting
- API key authentication via better-auth
- Simple redirect UI to external configurable URL

### Phase 2: Frontend UI (Future)
- Web interface for voting on features
- Display feature list with vote counts
- User-friendly voting experience

---

## Technical Requirements

### Authentication & Authorization
- Use **better-auth** as the authentication framework
- API endpoints protected by API keys
- Users do NOT need to register; they remain anonymous
- Each user must provide a **UUID** to identify themselves for voting
- The UUID prevents double-voting per feature

### Voting Rules
- Each user (identified by UUID) gets **one vote per feature**
- Users can only **upvote** (no downvoting)
- Users can **withdraw** their vote at any time
- Voting requires a valid API key

### Database Schema (PostgreSQL)

#### Table: `features`
| Column       | Type         | Constraints           | Description                     |
|--------------|--------------|----------------------|--------------------------------|
| id           | UUID         | PRIMARY KEY          | Unique feature identifier       |
| title        | VARCHAR(255) | NOT NULL             | Feature title                   |
| description  | TEXT         | NOT NULL             | Feature description             |
| status       | VARCHAR(50)  | NOT NULL             | Feature status (e.g., planned, in-progress, completed) |
| app_version  | VARCHAR(50)  | NULLABLE             | Target app version (optional)   |
| vote_count   | INTEGER      | DEFAULT 0            | Cached vote count               |
| created_at   | TIMESTAMP    | DEFAULT NOW()        | Creation timestamp              |
| updated_at   | TIMESTAMP    | DEFAULT NOW()        | Last update timestamp           |

#### Table: `voted_users`
| Column       | Type         | Constraints                          | Description                     |
|--------------|--------------|-------------------------------------|--------------------------------|
| id           | UUID         | PRIMARY KEY                         | Unique vote record identifier   |
| user_uuid    | UUID         | NOT NULL                            | Anonymous user identifier       |
| feature_id   | UUID         | NOT NULL, FOREIGN KEY (features.id) | Reference to voted feature      |
| created_at   | TIMESTAMP    | DEFAULT NOW()                       | Vote timestamp                  |
| UNIQUE       |              | (user_uuid, feature_id)             | Prevent double-voting           |

### Environment Configuration

**Files:**
- `.env.example` - Template with all required variables (committed to Git)
- `.env.development` - Development configuration (gitignored)
- `.env.production` - Production configuration (gitignored)

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/roadmap_db

# Authentication (better-auth)
BETTER_AUTH_SECRET=your-secret-key
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# API Configuration
API_KEY_HEADER=x-api-key

# Redirect URL (Phase 1 - simple UI redirects here)
REDIRECT_URL=https://your-main-app.com

# App Configuration
NODE_ENV=development
```

---

## API Endpoints (Phase 1)

### Features

| Method | Endpoint              | Description                    | Auth Required |
|--------|----------------------|--------------------------------|---------------|
| GET    | /api/features        | List all features              | Yes (API Key) |
| GET    | /api/features/:id    | Get feature by ID              | Yes (API Key) |

### Voting

| Method | Endpoint                        | Description                    | Auth Required |
|--------|---------------------------------|--------------------------------|---------------|
| POST   | /api/features/:id/vote          | Vote for a feature             | Yes (API Key) |
| DELETE | /api/features/:id/vote          | Withdraw vote from a feature   | Yes (API Key) |
| GET    | /api/features/:id/vote/:uuid    | Check if user voted for feature| Yes (API Key) |

### Vote Request Body
```json
{
  "userId": "uuid-of-user"
}
```

**Note:** The `featureId` is now part of the URL path, not the request body.

---

## Project Structure

```
roadmap-nextjs-backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── features/
│   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PUT, DELETE by ID
│   │   │   ├── features/
│   │   │   │   ├── route.ts          # GET (list)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET (single feature)
│   │   │   │       └── vote/
│   │   │   │           ├── route.ts  # POST (vote), DELETE (withdraw)
│   │   │   │           └── [uuid]/
│   │   │   │               └── route.ts  # GET (check vote status)
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts      # better-auth handlers
│   │   ├── page.tsx                  # Simple redirect page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── auth.ts                   # better-auth configuration
│   │   ├── db.ts                     # Database connection
│   │   └── api-key.ts                # API key validation middleware
│   └── types/
│       └── index.ts                  # TypeScript type definitions
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── prisma.config.ts              # Prisma 7 configuration
├── src/
│   └── generated/
│       └── prisma/                   # Generated Prisma client (gitignored)
├── .env.example
├── .env.development                  # gitignored
├── .env.production                   # gitignored
├── .gitignore
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Technology Stack

| Category       | Technology                  |
|----------------|----------------------------|
| Framework      | Next.js 16+ (App Router)   |
| Language       | TypeScript                 |
| Database       | PostgreSQL                 |
| ORM            | Prisma 7+                  |
| Authentication | better-auth                |
| Styling        | Tailwind CSS               |
| Validation     | Zod                        |

---

## Feature Status Values

The `status` field in the `features` table should use one of:
- `planned` - Feature is planned for future development
- `in-progress` - Feature is currently being developed
- `completed` - Feature has been released
- `rejected` - Feature was rejected/declined

---

## Security Considerations

1. **API Key Validation**: All API endpoints require valid API key in header
2. **UUID Validation**: Validate UUID format before processing votes
3. **Rate Limiting**: Implement rate limiting on vote endpoints (recommended)
4. **Input Validation**: Use Zod schemas for all request body validation
5. **SQL Injection Prevention**: Use Prisma ORM with parameterized queries

---

## Phase 1 UI Behavior

The root page (`/`) should:
1. Display a simple message (e.g., "Roadmap API Server")
2. Provide a link/redirect to the URL specified in `REDIRECT_URL` environment variable
3. Optionally show API documentation link

---

## Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Database migrations (Prisma)
npx prisma migrate dev
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Response Format

All API responses should follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing API key
- `FORBIDDEN` - Valid API key but insufficient permissions
- `NOT_FOUND` - Resource not found
- `ALREADY_VOTED` - User already voted for this feature
- `VOTE_NOT_FOUND` - Vote does not exist (when withdrawing)
- `VALIDATION_ERROR` - Request body validation failed
