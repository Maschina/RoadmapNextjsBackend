# Roadmap-Nextjs-Backend

A feature voting system API built with Next.js. Users can vote for product roadmap features using API key authentication.

## Features

- 🗳️ **Feature Voting**: Users can upvote features they want to see implemented
- 🔑 **API Key Authentication**: Secure API access using better-auth
- 👤 **Anonymous Voting**: Users vote using a UUID without registration
- 🚫 **Double-Vote Prevention**: Each user can only vote once per feature
- ↩️ **Vote Withdrawal**: Users can withdraw their vote at any time

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Authentication**: better-auth
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/roadmap-nextjs-backend.git
   cd roadmap-nextjs-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.development
   ```
   Edit `.env.development` with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: A secure secret key (min 32 characters)
   - `NEXT_PUBLIC_BETTER_AUTH_URL`: Your app URL (e.g., `http://localhost:3000`)
   - `REDIRECT_URL`: URL to redirect from the landing page

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Set up the database (run migrations):
   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`.

## API Endpoints

### Features

| Method | Endpoint           | Description          |
|--------|-------------------|----------------------|
| GET    | /api/features     | List all features    |
| GET    | /api/features/:id | Get feature by ID    |

### Voting

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/features/:id/vote          | Vote for a feature       |
| DELETE | /api/features/:id/vote          | Withdraw a vote          |
| GET    | /api/features/:id/vote/:uuid    | Check vote status        |

### Request Headers

All API requests require an API key:
```
x-api-key: your-api-key
```

### Vote Request Body

```json
{
  "userUuid": "uuid-of-user"
}
```

Note: The `featureId` is now part of the URL path (`/api/features/:id/vote`), not the request body.

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Environment Variables

| Variable            | Description                              | Required |
|--------------------|------------------------------------------|----------|
| DATABASE_URL       | PostgreSQL connection string             | Yes      |
| BETTER_AUTH_SECRET | Secret key for better-auth (min 32 chars)| Yes      |
| NEXT_PUBLIC_BETTER_AUTH_URL    | Base URL for authentication              | Yes      |
| API_KEY_HEADER     | Header name for API key (default: x-api-key) | No   |
| REDIRECT_URL       | URL to redirect from landing page        | Yes      |
| NODE_ENV           | Environment (development/production)     | Yes      |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate

# Run database migrations (development)
npx prisma migrate dev

# Deploy database migrations (production)
npx prisma migrate deploy
```

## Creating API Keys

API keys are managed through better-auth. To create an API key for a user, you can use the better-auth API endpoints or create them programmatically:

1. If not yet done, create a new user:
```console
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

2. Log in with this user:
```console
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -c cookies.txt \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password"
  }'
```

3. Create a new API key using the login session:
```console
curl -X POST http://localhost:3000/api/auth/api-key/create \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -b cookies.txt \
  -d '{
    "name": "We Love Lights",
    "expiresIn": 31536000
  }'
```

## License

MIT
