import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const weight = Number(body.weight);

    if (!Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid weight." },
        { status: 400 }
      );
    }

    const metric = await prisma.bodyMetric.create({
      data: {
        userId: session.user.id,
        weight,
      },
      select: {
        id: true,
        weight: true,
        recordedAt: true,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("SAVE_WEIGHT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to save weight." },
      { status: 500 }
    );
  }
}