"use client";

import { 
  AccountSettingsCards,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-6">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Settings: name, username, avatar, etc. */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Profile</h2>
            <AccountSettingsCards />
          </div>

          {/* Security Settings: password, 2FA, sessions, etc. */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Security</h2>
            <SecuritySettingsCards />
          </div>
        </div>
      </div>
    </div>
  );
}
