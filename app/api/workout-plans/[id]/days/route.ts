import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(
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
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Day name is required." },
        { status: 400 }
      );
    }

    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        days: {
          orderBy: {
            dayNumber: "desc",
          },
          take: 1,
          select: {
            dayNumber: true,
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

    const lastDayNumber = plan.days[0]?.dayNumber ?? 0;

    const day = await prisma.workoutDay.create({
      data: {
        workoutPlanId: plan.id,
        name,
        dayNumber: lastDayNumber + 1,
      },
      select: {
        id: true,
        name: true,
        dayNumber: true,
      },
    });

    return NextResponse.json(day, { status: 201 });
  } catch (error) {
    console.error(
      "POST /api/workout-plans/[id]/days error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create workout day." },
      { status: 500 }
    );
  }
}
