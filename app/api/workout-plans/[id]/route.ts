import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: Props
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isTemplate: true,
        days: {
          orderBy: {
            dayNumber: "asc",
          },
          select: {
            id: true,
            name: true,
            dayNumber: true,
            exercises: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                order: true,
                targetSets: true,
                targetReps: true,
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    primaryMuscle: true,
                    equipment: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Workout plan not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error(
      "GET /api/workout-plans/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load workout plan." },
      { status: 500 }
    );
  }
}
