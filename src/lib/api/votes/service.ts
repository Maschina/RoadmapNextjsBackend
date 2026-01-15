'use client';

import { ApiServiceError } from '@/lib/api/api-service-error';
import type {
  VotedUser,
  VoteCreateRequest,
  VoteWithdrawRequest,
  VoteStatus,
  ApiSuccessResponse,
} from '@/types';

/**
 * VoteService handles all vote-related API calls
 * This service is client-side only and integrates with React Query
 * 
 * All methods throw ApiServiceError on failure
 */
export default class VoteService {
  /**
   * Cast a vote for a feature
   * @see {@link file://./../../../app/api/features/[id]/vote/route.ts POST /api/features/:id/vote}
   * @param featureId - The feature ID to vote for
   * @param data - Vote data including userUuid
   * @throws {ApiServiceError} When API call fails
   */
  public static async castVote(
    featureId: string,
    data: VoteCreateRequest
  ): Promise<VotedUser> {
    try {
      const response = await fetch(`/api/features/${featureId}/vote`, {
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

      const result: ApiSuccessResponse<VotedUser> = await response.json();

      // Transform date from string to Date object
      return {
        ...result.data,
        createdAt: new Date(result.data.createdAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'casting vote');
    }
  }

  /**
   * Withdraw a vote from a feature
   * @see {@link file://./../../../app/api/features/[id]/vote/route.ts DELETE /api/features/:id/vote}
   * @param featureId - The feature ID to withdraw vote from
   * @param data - Vote data including userUuid
   * @throws {ApiServiceError} When API call fails
   */
  public static async withdrawVote(
    featureId: string,
    data: VoteWithdrawRequest
  ): Promise<void> {
    try {
      const response = await fetch(`/api/features/${featureId}/vote`, {
        method: 'DELETE',
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
    } catch (error) {
      throw ApiServiceError.fromError(error, 'withdrawing vote');
    }
  }

  /**
   * Check vote status for a user on a feature
   * @see {@link file://./../../../app/api/features/[id]/vote/[userId]/route.ts GET /api/features/:id/vote/:userId}
   * @param featureId - The feature ID
   * @param userId - The user UUID
   * @throws {ApiServiceError} When API call fails
   */
  public static async checkVoteStatus(
    featureId: string,
    userId: string
  ): Promise<VoteStatus> {
    try {
      const response = await fetch(`/api/features/${featureId}/vote/${userId}`, {
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

      const result: ApiSuccessResponse<VoteStatus> = await response.json();
      const voteStatus = result.data;

      // Transform votedAt date if it exists
      return {
        ...voteStatus,
        votedAt: voteStatus.votedAt ? new Date(voteStatus.votedAt) : null,
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'checking vote status');
    }
  }
}
