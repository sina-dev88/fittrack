import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const records =
      await prisma.personalRecord.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          achievedAt: "desc",
        },
        select: {
          id: true,
          weight: true,
          reps: true,
          estimated1RM: true,
          achievedAt: true,
          exercise: {
            select: {
              id: true,
              name: true,
              primaryMuscle: true,
            },
          },
        },
      });

    return NextResponse.json({
      records,
    });
  } catch (error) {
    console.error(
      "GET /api/progress/prs error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load personal records.",
      },
      {
        status: 500,
      }
    );
  }
}