# Setup Scripts

This directory contains utility scripts for setting up and managing the Roadmap application.

## setup-admin.ts

Creates or updates the initial admin user in the database.

### Usage

```bash
# Development environment
npm run setup:admin

# Production environment
npm run setup:admin:prod
```

### Environment Variables

The script reads the following environment variables:

- `ADMIN_EMAIL` - Email address for the admin user (default: "admin@example.com")
- `ADMIN_PASSWORD` - Password for the admin user (default: "secure123")
- `ADMIN_NAME` - Display name for the admin user (default: "Admin User")

### What it does

1. Checks if a user with the specified email already exists
2. If the user exists:
   - Updates their role to "admin"
   - Sets `banned` to `false`
   - Clears any ban reason or expiration
3. If the user doesn't exist:
   - Creates a new user with role "admin"
   - Sets `banned` to `false` and `emailVerified` to `true`
   - Creates an associated account entry with hashed password
   - Uses bcrypt to hash the password (same as better-auth)

### Security Notes

- The password is hashed using bcrypt with 10 salt rounds
- The admin user is marked as email verified by default
- The admin user is never banned (even when the auto-ban hook runs)
- Change the default password immediately after first login

### Example

Set up an admin user in development:

```bash
# Add to .env.development
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=John Doe

# Run the script
npm run setup:admin
```

### Output

The script provides detailed output:
- Environment being used (development/production)
- Admin email being set up
- Whether the user already exists or is being created
- Success confirmation with login credentials

### Troubleshooting

**Error: User already exists but password not updated**
- The script only updates the user's role and ban status
- To change the password, delete the user and run the script again
- Or manually update the password hash in the `account` table

**Error: Database connection failed**
- Check that `DATABASE_URL` is correct in your .env file
- Ensure PostgreSQL is running
- Verify database exists and migrations have been run

**Error: Module not found**
- Run `npm install` to install dependencies
- Run `npx prisma generate` to generate Prisma client
