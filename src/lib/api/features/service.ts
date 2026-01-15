'use client';

import { ApiServiceError } from '@/lib/api/api-service-error';
import type {
  Feature,
  FeatureCreateRequest,
  FeatureUpdateRequest,
  ApiSuccessResponse,
} from '@/types';

/**
 * FeatureService handles all feature-related API calls
 * This service is client-side only and integrates with React Query
 * 
 * All methods throw ApiServiceError on failure
 */
export default class FeatureService {
  /**
   * Get all features (dashboard view - requires authentication)
   * @see {@link file://./../../../app/api/dashboard/features/route.ts API Route Implementation}
   * @throws {ApiServiceError} When API call fails
   */
  public static async getFeatures(): Promise<Feature[]> {
    try {
      const response = await fetch('/api/dashboard/features', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data: ApiSuccessResponse<Feature[]> = await response.json();

      // Transform dates from strings to Date objects
      return data.data.map((feature) => ({
        ...feature,
        createdAt: new Date(feature.createdAt),
        updatedAt: new Date(feature.updatedAt),
      }));
    } catch (error) {
      throw ApiServiceError.fromError(error, 'fetching features');
    }
  }

  /**
   * Get a single feature by ID
   * @see {@link file://./../../../app/api/dashboard/features/[id]/route.ts API Route Implementation}
   * @param featureId - The feature ID
   * @throws {ApiServiceError} When API call fails
   */
  public static async getFeature(featureId: string): Promise<Feature> {
    try {
      const response = await fetch(`/api/dashboard/features/${featureId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data: ApiSuccessResponse<Feature> = await response.json();

      // Transform dates from strings to Date objects
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        updatedAt: new Date(data.data.updatedAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'fetching feature');
    }
  }

  /**
   * Create a new feature (Admin only)
   * @see {@link file://./../../../app/api/dashboard/features/route.ts POST /api/dashboard/features}
   * @param data - Feature creation data
   * @throws {ApiServiceError} When API call fails
   */
  public static async createFeature(data: FeatureCreateRequest): Promise<Feature> {
    try {
      const response = await fetch('/api/dashboard/features', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const result: ApiSuccessResponse<Feature> = await response.json();

      // Transform dates from strings to Date objects
      return {
        ...result.data,
        createdAt: new Date(result.data.createdAt),
        updatedAt: new Date(result.data.updatedAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'creating feature');
    }
  }

  /**
   * Update a feature (Admin only)
   * @see {@link file://./../../../app/api/dashboard/features/[id]/route.ts PUT /api/dashboard/features/[id]}
   * @param featureId - The feature ID
   * @param data - Feature update data
   * @throws {ApiServiceError} When API call fails
   */
  public static async updateFeature(
    featureId: string,
    data: FeatureUpdateRequest
  ): Promise<Feature> {
    try {
      const response = await fetch(`/api/dashboard/features/${featureId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const result: ApiSuccessResponse<Feature> = await response.json();

      // Transform dates from strings to Date objects
      return {
        ...result.data,
        createdAt: new Date(result.data.createdAt),
        updatedAt: new Date(result.data.updatedAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'updating feature');
    }
  }

  /**
   * Delete a feature by ID (Admin only)
   * @see {@link file://./../../../app/api/dashboard/features/[id]/route.ts DELETE /api/dashboard/features/[id]}
   * @param featureId - The feature ID
   * @throws {ApiServiceError} When API call fails
   */
  public static async deleteFeature(featureId: string): Promise<void> {
    try {
      const response = await fetch(`/api/dashboard/features/${featureId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }
    } catch (error) {
      throw ApiServiceError.fromError(error, 'deleting feature');
    }
  }

  /**
   * Get all features (public API - requires API key)
   * @see {@link file://./../../../app/api/features/route.ts API Route Implementation}
   * @throws {ApiServiceError} When API call fails
   */
  public static async getPublicFeatures(): Promise<Feature[]> {
    try {
      const response = await fetch('/api/features', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data: ApiSuccessResponse<Feature[]> = await response.json();

      // Transform dates from strings to Date objects
      return data.data.map((feature) => ({
        ...feature,
        createdAt: new Date(feature.createdAt),
        updatedAt: new Date(feature.updatedAt),
      }));
    } catch (error) {
      throw ApiServiceError.fromError(error, 'fetching public features');
    }
  }
}
