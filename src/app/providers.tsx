"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/api/queryClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthUIProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => {
          // Clear router cache for protected routes
          router.refresh();
        }}
        Link={Link}
        apiKey={true}
      >
        {children}
      </AuthUIProvider>
    </QueryClientProvider>
  );
}
