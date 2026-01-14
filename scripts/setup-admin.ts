import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("\n❌ Error: DATABASE_URL environment variable is not set!");
  console.error("Make sure you have a .env.development file with DATABASE_URL configured.\n");
  process.exit(1);
}

// Initialize Prisma with the PostgreSQL adapter (same as db.ts)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "secure123";
  const adminName = process.env.ADMIN_NAME || "Admin User";

  console.log("\n🔧 Setting up admin user...\n");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Admin Email: ${adminEmail}`);

  try {
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("\n⚠️  Admin user already exists!");
      console.log(`User ID: ${existingUser.id}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Role: ${existingUser.role}`);
      console.log(`Banned: ${existingUser.banned}`);

      // Update existing user to ensure they're not banned and have admin role
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "admin",
          banned: false,
          banReason: null,
          banExpiresAt: null,
        },
      });

      console.log("\n✅ Updated existing user to admin status (unbanned)");
      return;
    }

    // Hash the password using bcrypt (same as better-auth uses internally)
    const hashedPassword = await hash(adminPassword, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: "admin",
        banned: false,
        emailVerified: true, // Admin doesn't need email verification
      },
    });

    console.log("\n✅ Admin user created:");
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);

    // Create the account with password
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id, // For email/password, accountId is the same as userId
        providerId: "credential", // better-auth uses "credential" for email/password
        password: hashedPassword,
      },
    });

    console.log("\n✅ Admin account created:");
    console.log(`Account ID: ${account.id}`);
    console.log(`Provider: ${account.providerId}`);

    console.log("\n✨ Setup complete! You can now log in with:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n⚠️  Make sure to change the password after first login!\n");
  } catch (error) {
    console.error("\n❌ Error setting up admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
