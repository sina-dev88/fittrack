import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
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
      include: {
        days: {
          include: {
            exercises: {
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            dayNumber: "asc",
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

    return NextResponse.json({
      plan,
    });
  } catch (error) {
    console.error("GET_WORKOUT_SESSION_ERROR", error);

    return NextResponse.json(
      { error: "Failed to load workout session." },
      { status: 500 }
    );
  }
}
