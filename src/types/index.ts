import { z } from "zod";

// ============================================
// API Response Types
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Error Codes
// ============================================

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ALREADY_VOTED"
  | "VOTE_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

// ============================================
// Feature Types
// ============================================

export type FeatureStatus = "planned" | "in-progress" | "completed" | "rejected";

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  appVersion: string | null;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureCreateRequest {
  title: string;
  description: string;
  status: FeatureStatus;
  appVersion?: string | null;
}

export interface FeatureUpdateRequest {
  title?: string;
  description?: string;
  status?: FeatureStatus;
  appVersion?: string | null;
}

// ============================================
// Vote Types
// ============================================

export interface VotedUser {
  id: string;
  userUuid: string;
  featureId: string;
  createdAt: Date;
}

export interface VoteStatus {
  hasVoted: boolean;
  votedAt: Date | null;
}

export interface VoteCreateRequest {
  userUuid: string;
}

export interface VoteWithdrawRequest {
  userUuid: string;
}

// ============================================
// Zod Schemas for Validation
// ============================================

export const UuidSchema = z.uuid("Invalid UUID format");

export const VoteRequestSchema = z.object({
  userId: UuidSchema,
});

export type VoteRequest = z.infer<typeof VoteRequestSchema>;

// ============================================
// Helper Functions
// ============================================

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(code: ErrorCode, message: string): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
