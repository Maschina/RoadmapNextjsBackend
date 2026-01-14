import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiKey } from "@/lib/api-key";
import { successResponse, errorResponse, VoteStatus, UuidSchema } from "@/types";

interface RouteParams {
  params: Promise<{ id: string; userId: string }>;
}

/**
 * GET /api/features/:id/vote/:uuid
 * Check if a user has voted for a specific feature
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Validate API key
  const authResult = await requireApiKey(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id: featureId, userId: userUuid } = await params;

  try {
    // Check if the vote exists
    const vote = await prisma.votedUser.findUnique({
      where: {
        userUuid_featureId: {
          userUuid,
          featureId,
        },
      },
    });

    const voteStatus: VoteStatus = {
      hasVoted: !!vote,
      votedAt: vote?.createdAt ?? null,
    };

    return Response.json(successResponse(voteStatus));
  } catch (error) {
    console.error("Error checking vote status:", error);
    return Response.json(
      errorResponse("INTERNAL_ERROR", "Failed to check vote status"),
      { status: 500 }
    );
  }
}
