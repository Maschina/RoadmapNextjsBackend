"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { FeatureTable } from "@/components/features/feature-table";
import { FeatureDialog } from "@/components/features/feature-dialog";
import { toast } from "sonner";

interface Feature {
  id: string;
  title: string;
  description: string;
  status: string;
  appVersion?: string | null;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const response = await fetch("/api/dashboard/features");
      if (!response.ok) throw new Error("Failed to fetch features");
      const data = await response.json();
      setFeatures(data.data || []);
    } catch (error) {
      console.error("Error fetching features:", error);
      toast.error("Failed to load features");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleCreate = async (featureData: Omit<Feature, "id" | "voteCount" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/dashboard/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(featureData),
      });

      if (!response.ok) throw new Error("Failed to create feature");

      toast.success("Feature created successfully");
      fetchFeatures();
    } catch (error) {
      console.error("Error creating feature:", error);
      toast.error("Failed to create feature");
      throw error;
    }
  };

  const handleUpdate = async (id: string, featureData: Partial<Feature>) => {
    try {
      const response = await fetch(`/api/dashboard/features/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(featureData),
      });

      if (!response.ok) throw new Error("Failed to update feature");

      toast.success("Feature updated successfully");
      fetchFeatures();
    } catch (error) {
      console.error("Error updating feature:", error);
      toast.error("Failed to update feature");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/features/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete feature");

      toast.success("Feature deleted successfully");
      fetchFeatures();
    } catch (error) {
      console.error("Error deleting feature:", error);
      toast.error("Failed to delete feature");
      throw error;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader
        title="Features"
        description="Manage roadmap features and track votes"
      />
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">All Features</h2>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage your roadmap features
            </p>
          </div>
          <FeatureDialog onSave={handleCreate} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Loading features...</p>
          </div>
        ) : (
          <FeatureTable
            features={features}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
