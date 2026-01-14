import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiKey } from "@/lib/api-key";
import { successResponse, errorResponse, Feature } from "@/types";

/**
 * GET /api/features
 * List all features with their vote counts
 */
export async function GET(request: NextRequest) {
  // Validate API key
  const authResult = await requireApiKey(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const features = await prisma.feature.findMany({
      orderBy: [
        { voteCount: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Map to API response format
    const featureList: Feature[] = features.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: f.status as Feature["status"],
      appVersion: f.appVersion,
      voteCount: f.voteCount,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    return Response.json(successResponse(featureList));
  } catch (error) {
    console.error("Error fetching features:", error);
    return Response.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch features"),
      { status: 500 }
    );
  }
}
