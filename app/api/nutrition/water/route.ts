import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const amountMl = Number(body.amountMl);

    if (
      !Number.isFinite(amountMl) ||
      amountMl <= 0 ||
      amountMl > 10000
    ) {
      return NextResponse.json(
        { error: "Invalid water amount." },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    const dateKey = getDateKey();

    const nutritionDay =
      await prisma.nutritionDay.upsert({
        where: {
          userId_dateKey: {
            userId,
            dateKey,
          },
        },
        update: {},
        create: {
          userId,
          dateKey,
        },
        select: {
          id: true,
        },
      });

    const waterLog =
      await prisma.waterLog.create({
        data: {
          nutritionDayId: nutritionDay.id,
          amountMl: Math.round(amountMl),
        },
        select: {
          id: true,
          amountMl: true,
          loggedAt: true,
        },
      });

    return NextResponse.json(
      waterLog,
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/nutrition/water error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to add water." },
      { status: 500 },
    );
  }
}
