import { DashboardHeader } from "@/components/dashboard/header";
import { ApiKeysCard } from "@daveyplate/better-auth-ui";

export default function ApiKeysPage() {
  return (
    <div className="flex h-full flex-col">
      <DashboardHeader
        title="API Key Management"
        description="Create and manage API keys for accessing the Roadmap API"
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <ApiKeysCard />
        </div>
      </div>
    </div>
  );
}
