import { NextRequest } from "next/server";
import { auth } from "./auth";
import { errorResponse, ApiErrorResponse } from "@/types";

const API_KEY_HEADER = process.env.API_KEY_HEADER || "x-api-key";

export interface ApiKeyValidationResult {
  valid: true;
  keyId: string;
  userId: string;
}

export interface ApiKeyValidationError {
  valid: false;
  response: Response;
}

export type ApiKeyResult = ApiKeyValidationResult | ApiKeyValidationError;

/**
 * Validates the API key from the request headers.
 * Returns the validation result or an error response.
 */
export async function validateApiKey(request: NextRequest): Promise<ApiKeyResult> {
  const apiKeyValue = request.headers.get(API_KEY_HEADER);

  if (!apiKeyValue) {
    return {
      valid: false,
      response: createErrorResponse("UNAUTHORIZED", "API key is required", 401),
    };
  }

  try {
    const result = await auth.api.verifyApiKey({
      body: {
        key: apiKeyValue,
      },
    });

    if (!result.valid || !result.key) {
      return {
        valid: false,
        response: createErrorResponse(
          "UNAUTHORIZED",
          result.error?.message || "Invalid API key",
          401
        ),
      };
    }

    return {
      valid: true,
      keyId: result.key.id,
      userId: result.key.userId,
    };
  } catch {
    return {
      valid: false,
      response: createErrorResponse("UNAUTHORIZED", "Invalid API key", 401),
    };
  }
}

/**
 * Creates a standardized error response.
 */
function createErrorResponse(
  code: ApiErrorResponse["error"]["code"],
  message: string,
  status: number
): Response {
  return Response.json(errorResponse(code, message), { status });
}

/**
 * Helper to quickly check if request has valid API key and return error response if not.
 * Use this in route handlers for cleaner code.
 */
export async function requireApiKey(
  request: NextRequest
): Promise<{ authorized: true; userId: string } | { authorized: false; response: Response }> {
  const result = await validateApiKey(request);

  if (!result.valid) {
    return { authorized: false, response: result.response };
  }

  return { authorized: true, userId: result.userId };
}
