"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import FeatureService from "@/lib/api/features/service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeyFactory";

export default function DashboardPage() {
  const {
    data: features = [],
    isLoading,
  } = useQuery({
    queryKey: queryKeys.features.list(),
    queryFn: () => FeatureService.getFeatures(),
  });

  // Calculate total votes
  const totalVotes = features.reduce((sum, feature) => sum + feature.voteCount, 0);
  
  return (
    <div className="flex h-full flex-col">
      <DashboardHeader
        title="Dashboard Overview"
        description="This is your central hub for managing features, API keys, and user approvals.
            Navigate using the sidebar to get started."
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Overview cards */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Total Features</h3>
            <p className="mt-2 text-3xl font-bold">
              {isLoading ? "..." : features.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Features in the roadmap
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Total Votes</h3>
            <p className="mt-2 text-3xl font-bold">
              {isLoading ? "..." : totalVotes}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Votes from users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
