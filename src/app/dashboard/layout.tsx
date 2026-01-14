"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="flex h-screen">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </SignedIn>
    </>
  );
}
