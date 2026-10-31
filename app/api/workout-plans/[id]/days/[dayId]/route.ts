import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
    dayId: string;
  }>;
};

export async function PATCH(
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

    const { id, dayId } = await params;
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Day name is required." },
        { status: 400 }
      );
    }

    const day = await prisma.workoutDay.findFirst({
      where: {
        id: dayId,
        workoutPlan: {
          id,
          userId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!day) {
      return NextResponse.json(
        { error: "Workout day not found." },
        { status: 404 }
      );
    }

    const updatedDay = await prisma.workoutDay.update({
      where: {
        id: day.id,
      },
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        dayNumber: true,
      },
    });

    return NextResponse.json(updatedDay);
  } catch (error) {
    console.error(
      "PATCH /api/workout-plans/[id]/days/[dayId] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update workout day." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id, dayId } = await params;

    const day = await prisma.workoutDay.findFirst({
      where: {
        id: dayId,
        workoutPlan: {
          id,
          userId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!day) {
      return NextResponse.json(
        { error: "Workout day not found." },
        { status: 404 }
      );
    }

    await prisma.workoutDay.delete({
      where: {
        id: day.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/workout-plans/[id]/days/[dayId] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete workout day." },
      { status: 500 }
    );
  }
}
