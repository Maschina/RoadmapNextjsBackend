import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiKey } from "@/lib/api-key";
import { successResponse, errorResponse, Feature } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/features/:id
 * Get a single feature by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Validate API key
  const authResult = await requireApiKey(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id } = await params;

  try {
    const feature = await prisma.feature.findUnique({
      where: { id },
    });

    if (!feature) {
      return Response.json(
        errorResponse("NOT_FOUND", "Feature not found"),
        { status: 404 }
      );
    }

    const featureResponse: Feature = {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      status: feature.status as Feature["status"],
      appVersion: feature.appVersion,
      voteCount: feature.voteCount,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };

    return Response.json(successResponse(featureResponse));
  } catch (error) {
    console.error("Error fetching feature:", error);
    return Response.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch feature"),
      { status: 500 }
    );
  }
}
