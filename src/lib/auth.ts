import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, apiKey } from "better-auth/plugins";
import { prisma } from "./db";
import bcrypt from "bcrypt";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          // Auto-ban new users pending admin approval
          // The first user (admin) should be created manually or via seed
          const userCount = await prisma.user.count();
          
          if (userCount > 1) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                banned: true,
                banReason: "pending_approval",
              },
            });
          }
        },
      },
    },
  },
  plugins: [
    admin({
      // You can specify admin user IDs here or rely on role-based access
      // adminUserIds: ["admin-user-id"],
    }),
    apiKey({
      // Header name for API key (default is x-api-key)
      apiKeyHeaders: process.env.API_KEY_HEADER || "x-api-key",
      // Rate limiting configuration
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60, // 1 minute window
        maxRequests: 100, // 100 requests per minute
      },
      // Default key length
      defaultKeyLength: 32,
      // Default prefix for API keys
      defaultPrefix: "rmap_",
    }),
  ],
});

export type Auth = typeof auth;
