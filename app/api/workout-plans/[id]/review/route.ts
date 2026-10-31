
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        userId,
        isTemplate: false,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Workout plan not found." },
        { status: 404 },
      );
    }

    const now = new Date();
    const nextReviewAt = new Date(
      now.getTime() + 28 * 24 * 60 * 60 * 1000,
    );

    await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: {
        lastReviewedAt: now,
        nextReviewAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workout plan review recorded.",
      planId: plan.id,
      planName: plan.name,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: nextReviewAt.toISOString(),
    });
  } catch (error) {
    console.error("POST workout plan review error:", error);

    return NextResponse.json(
      { error: "Failed to record workout plan review." },
      { status: 500 },
    );
  }
}
