"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/header";
import { FeatureTable } from "@/components/features/feature-table";
import { FeatureDialog } from "@/components/features/feature-dialog";
import { toast } from "sonner";
import FeatureService from "@/lib/api/features/service";
import { queryKeys, mutationKeys } from "@/lib/api/queryKeyFactory";
import { ApiServiceError } from "@/lib/api/api-service-error";
import type { FeatureCreateRequest, FeatureStatus, FeatureUpdateRequest } from "@/types";

export default function FeaturesPage() {
  const queryClient = useQueryClient();

  // Fetch features query
  const {
    data: features = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.features.list(),
    queryFn: () => FeatureService.getFeatures(),
  });

  // Create feature mutation
  const createMutation = useMutation({
    mutationKey: mutationKeys.features.create,
    mutationFn: (data: FeatureCreateRequest) => FeatureService.createFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all() });
      toast.success("Feature created successfully");
    },
    onError: (error) => {
      if (error instanceof ApiServiceError) {
        toast.error(error.userMessage);

        if (error.isAuthenticationError()) {
          toast.error("Please log in again");
        } else if (error.isAuthorizationError()) {
          toast.error("You don't have permission to create features");
        }
      } else {
        toast.error("Failed to create feature");
      }
    },
  });

  // Update feature mutation
  const updateMutation = useMutation({
    mutationKey: mutationKeys.features.update,
    mutationFn: ({ id, data }: { id: string; data: FeatureUpdateRequest }) =>
      FeatureService.updateFeature(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all() });
      toast.success("Feature updated successfully");
    },
    onError: (error) => {
      if (error instanceof ApiServiceError) {
        toast.error(error.userMessage);

        if (error.isAuthenticationError()) {
          toast.error("Please log in again");
        } else if (error.isAuthorizationError()) {
          toast.error("You don't have permission to update features");
        } else if (error.isNotFoundError()) {
          toast.error("Feature not found");
        }
      } else {
        toast.error("Failed to update feature");
      }
    },
  });

  // Delete feature mutation
  const deleteMutation = useMutation({
    mutationKey: mutationKeys.features.delete,
    mutationFn: (id: string) => FeatureService.deleteFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all() });
      toast.success("Feature deleted successfully");
    },
    onError: (error) => {
      if (error instanceof ApiServiceError) {
        toast.error(error.userMessage);

        if (error.isAuthenticationError()) {
          toast.error("Please log in again");
        } else if (error.isAuthorizationError()) {
          toast.error("You don't have permission to delete features");
        } else if (error.isNotFoundError()) {
          toast.error("Feature not found");
        }
      } else {
        toast.error("Failed to delete feature");
      }
    },
  });

  // Handle create
  const handleCreate = async (featureData: {
    title: string;
    description: string;
    status: string;
    appVersion?: string | null;
  }) => {
    const createRequest: FeatureCreateRequest = {
      title: featureData.title,
      description: featureData.description,
      status: featureData.status as FeatureStatus,
      appVersion: featureData.appVersion,
    };
    await createMutation.mutateAsync(createRequest);
  };

  // Handle update
  const handleUpdate = async (id: string, featureData: {
    title?: string;
    description?: string;
    status?: string;
    appVersion?: string | null;
  }) => {
    const updateRequest: FeatureUpdateRequest = {
      title: featureData.title,
      description: featureData.description,
      status: featureData.status as FeatureStatus,
      appVersion: featureData.appVersion,
    };
    await updateMutation.mutateAsync({ id, data: updateRequest });
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  // Show error state
  if (error) {
    const errorMessage =
      error instanceof ApiServiceError ? error.userMessage : "Failed to load features";

    return (
      <div className="flex h-full flex-col">
        <DashboardHeader
          title="Features"
          description="Manage roadmap features and track votes"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center p-12">
            <p className="text-red-500">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

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

        {isLoading ? (
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
