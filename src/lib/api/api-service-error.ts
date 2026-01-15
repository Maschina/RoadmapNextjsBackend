'use client';

import { ZodError } from 'zod';

export enum ApiServiceErrorType {
  VALIDATION = 'VALIDATION',
  API_ERROR = 'API_ERROR',
  NETWORK = 'NETWORK',
}

export interface ValidationErrorDetails {
  issues: Array<{
    path: string[];
    message: string;
  }>;
  formattedMessage: string;
}

export interface ApiErrorDetails {
  name?: string;
  message: string;
  context?: unknown;
}

export interface NetworkErrorDetails {
  message: string;
  statusCode?: number;
  code?: string;
}

/**
 * Unified error class for API service layer
 * Handles three types of errors:
 * 1. Validation errors (from Zod)
 * 2. API errors (from API endpoints)
 * 3. Network errors (from Axios)
 */
export class ApiServiceError extends Error {
  public readonly type: ApiServiceErrorType;
  public readonly userMessage: string;
  public readonly validationDetails: ValidationErrorDetails | null = null;
  public readonly apiErrorDetails: ApiErrorDetails | null = null;
  public readonly networkDetails: NetworkErrorDetails | null = null;
  public readonly originalError: unknown;

  constructor(
    type: ApiServiceErrorType,
    userMessage: string,
    originalError: unknown,
    details?: ValidationErrorDetails | ApiErrorDetails | NetworkErrorDetails
  ) {
    super(userMessage);
    this.name = 'ApiServiceError';
    this.type = type;
    this.userMessage = userMessage;
    this.originalError = originalError;

    switch (type) {
      case ApiServiceErrorType.VALIDATION:
        this.validationDetails = details as ValidationErrorDetails;
        break;
      case ApiServiceErrorType.API_ERROR:
        this.apiErrorDetails = details as ApiErrorDetails;
        break;
      case ApiServiceErrorType.NETWORK:
        this.networkDetails = details as NetworkErrorDetails;
        break;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiServiceError);
    }
  }

  /**
   * Create ApiServiceError from any error
   * Automatically detects error type and creates appropriate instance
   */
  static fromError(error: unknown, context: string): ApiServiceError {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const issues = error.issues.map((issue) => ({
        path: issue.path.map(String),
        message: issue.message,
      }));

      const formattedMessage = issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      return new ApiServiceError(
        ApiServiceErrorType.VALIDATION,
        `Validation failed while ${context}`,
        error,
        { issues, formattedMessage }
      );
    }

    // Handle fetch/HTTP errors
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as any;

      // Check if it's an API error response
      if (httpError.response?.data && typeof httpError.response.data === 'object') {
        const data = httpError.response.data;

        // Handle structured error responses
        if (data.error) {
          const apiError = data.error;
          return new ApiServiceError(
            ApiServiceErrorType.API_ERROR,
            apiError.message || `Failed while ${context}`,
            error,
            {
              name: apiError.code || apiError.name,
              message: apiError.message || `Failed while ${context}`,
              context: apiError.context,
            }
          );
        }

        // Handle simple error messages
        if (data.message || data.error) {
          return new ApiServiceError(
            ApiServiceErrorType.API_ERROR,
            data.message || data.error || `Failed while ${context}`,
            error,
            {
              message: data.message || data.error || `Failed while ${context}`,
            }
          );
        }
      }

      // HTTP error with status code
      if (httpError.statusCode || httpError.status) {
        const statusCode = httpError.statusCode || httpError.status;
        return new ApiServiceError(
          ApiServiceErrorType.NETWORK,
          `Request failed while ${context}`,
          error,
          {
            message: httpError.message || `HTTP ${statusCode} error`,
            statusCode: statusCode,
            code: httpError.code,
          }
        );
      }
    }

    // Handle network errors (no response)
    if (error && typeof error === 'object' && ('statusCode' in error || 'code' in error)) {
      const networkError = error as any;
      if (networkError.statusCode === 0 || networkError.code === 'ERR_NETWORK') {
        return new ApiServiceError(
          ApiServiceErrorType.NETWORK,
          `Network error while ${context}`,
          error,
          {
            message: networkError.message || 'Network request failed',
            code: networkError.code,
          }
        );
      }
    }

    // Handle generic errors
    if (error instanceof Error) {
      return new ApiServiceError(
        ApiServiceErrorType.NETWORK,
        `Unexpected error while ${context}: ${error.message}`,
        error,
        {
          message: error.message,
        }
      );
    }

    // Unknown error type
    return new ApiServiceError(
      ApiServiceErrorType.NETWORK,
      `Unknown error while ${context}`,
      error,
      {
        message: String(error),
      }
    );
  }

  // Type checks
  isValidationError(): boolean {
    return this.type === ApiServiceErrorType.VALIDATION;
  }

  isApiError(): boolean {
    return this.type === ApiServiceErrorType.API_ERROR;
  }

  isNetworkError(): boolean {
    return this.type === ApiServiceErrorType.NETWORK;
  }

  // Condition checks
  isAuthenticationError(): boolean {
    return (
      this.apiErrorDetails?.name === 'UNAUTHORIZED' ||
      this.networkDetails?.statusCode === 401
    );
  }

  isAuthorizationError(): boolean {
    return (
      this.apiErrorDetails?.name === 'FORBIDDEN' ||
      this.networkDetails?.statusCode === 403
    );
  }

  isValidationFailure(): boolean {
    return (
      this.isValidationError() ||
      this.apiErrorDetails?.name === 'VALIDATION_ERROR' ||
      this.networkDetails?.statusCode === 400
    );
  }

  isNotFoundError(): boolean {
    return (
      this.apiErrorDetails?.name === 'NOT_FOUND' ||
      this.networkDetails?.statusCode === 404
    );
  }

  isConflictError(): boolean {
    return (
      this.apiErrorDetails?.name === 'ALREADY_VOTED' ||
      this.networkDetails?.statusCode === 409
    );
  }

  // Data access helpers
  getErrorName(): string | null {
    return this.apiErrorDetails?.name || null;
  }

  getErrorContext(): unknown {
    return this.apiErrorDetails?.context;
  }

  getValidationIssues(): ValidationErrorDetails['issues'] | null {
    return this.validationDetails?.issues || null;
  }
}
