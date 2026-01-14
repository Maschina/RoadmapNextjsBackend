import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <DashboardHeader
        title="Dashboard Overview"
        description="Manage your features, API keys, and users"
      />
      <div className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Overview cards */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Total Features</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Features in the roadmap
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Total Votes</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Votes from users
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Active API Keys</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Active API keys
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Welcome to Roadmap Dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            This is your central hub for managing features, API keys, and user approvals.
            Navigate using the sidebar to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
