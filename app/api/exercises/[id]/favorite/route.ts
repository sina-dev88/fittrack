import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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

    const { id: exerciseId } = await params;

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { id: true },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found." },
        { status: 404 }
      );
    }

    const existing = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
    });

    if (existing) {
      await prisma.favoriteExercise.delete({
        where: {
          id: existing.id,
        },
      });

      return NextResponse.json({
        favorited: false,
      });
    }

    await prisma.favoriteExercise.create({
      data: {
        userId: session.user.id,
        exerciseId,
      },
    });

    return NextResponse.json({
      favorited: true,
    });
  } catch (error) {
    console.error(
      "POST /api/exercises/[id]/favorite error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update favorite." },
      { status: 500 }
    );
  }
}
