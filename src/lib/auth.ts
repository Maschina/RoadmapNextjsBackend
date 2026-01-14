import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { apiKey } from "better-auth/plugins";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  plugins: [
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
