import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiKey } from "@/lib/api-key";
import { successResponse, errorResponse, UuidSchema } from "@/types";
import { z } from "zod";

const VoteBodySchema = z.object({
  userUuid: UuidSchema,
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/features/:id/vote
 * Vote for a feature
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Validate API key
  const authResult = await requireApiKey(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id: featureId } = await params;

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = VoteBodySchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body: " + parseResult.error.message),
        { status: 400 }
      );
    }

    const { userUuid } = parseResult.data;

    // Check if feature exists
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return Response.json(
        errorResponse("NOT_FOUND", "Feature not found"),
        { status: 404 }
      );
    }

    // Check if user already voted for this feature
    const existingVote = await prisma.votedUser.findUnique({
      where: {
        userUuid_featureId: {
          userUuid,
          featureId,
        },
      },
    });

    if (existingVote) {
      return Response.json(
        errorResponse("ALREADY_VOTED", "User has already voted for this feature"),
        { status: 409 }
      );
    }

    // Create vote and increment vote count in a transaction
    const vote = await prisma.$transaction(async (tx) => {
      const newVote = await tx.votedUser.create({
        data: {
          userUuid,
          featureId,
        },
      });

      await tx.feature.update({
        where: { id: featureId },
        data: {
          voteCount: {
            increment: 1,
          },
        },
      });

      return newVote;
    });

    return Response.json(
      successResponse({
        id: vote.id,
        userUuid: vote.userUuid,
        featureId: vote.featureId,
        createdAt: vote.createdAt,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vote:", error);
    return Response.json(
      errorResponse("INTERNAL_ERROR", "Failed to create vote"),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/features/:id/vote
 * Withdraw a vote from a feature
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Validate API key
  const authResult = await requireApiKey(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id: featureId } = await params;

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = VoteBodySchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body: " + parseResult.error.message),
        { status: 400 }
      );
    }

    const { userUuid } = parseResult.data;

    // Find the existing vote
    const existingVote = await prisma.votedUser.findUnique({
      where: {
        userUuid_featureId: {
          userUuid,
          featureId,
        },
      },
    });

    if (!existingVote) {
      return Response.json(
        errorResponse("VOTE_NOT_FOUND", "Vote does not exist"),
        { status: 404 }
      );
    }

    // Delete vote and decrement vote count in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.votedUser.delete({
        where: {
          id: existingVote.id,
        },
      });

      await tx.feature.update({
        where: { id: featureId },
        data: {
          voteCount: {
            decrement: 1,
          },
        },
      });
    });

    return Response.json(
      successResponse({ message: "Vote withdrawn successfully" })
    );
  } catch (error) {
    console.error("Error withdrawing vote:", error);
    return Response.json(
      errorResponse("INTERNAL_ERROR", "Failed to withdraw vote"),
      { status: 500 }
    );
  }
}
