import { createAuthClient } from "better-auth/react";
import { adminClient, apiKeyClient } from "better-auth/client/plugins";

console.log("Creating auth client with baseURL: ", process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    adminClient(),
    apiKeyClient(),
  ],
});

export type AuthClient = typeof authClient;
