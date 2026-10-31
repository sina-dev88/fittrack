import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      profile,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);

    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : undefined;

    const age =
      body.age === "" ||
      body.age === null ||
      body.age === undefined
        ? null
        : Number(body.age);

    const height =
      body.height === "" ||
      body.height === null ||
      body.height === undefined
        ? null
        : Number(body.height);

    const weight =
      body.weight === "" ||
      body.weight === null ||
      body.weight === undefined
        ? null
        : Number(body.weight);

    const trainingDays =
      body.trainingDays === "" ||
      body.trainingDays === null ||
      body.trainingDays === undefined
        ? null
        : Number(body.trainingDays);

    const gender =
      body.gender === "" ||
      body.gender === null ||
      body.gender === undefined
        ? null
        : String(body.gender);

    const goal =
      body.goal === "" ||
      body.goal === null ||
      body.goal === undefined
        ? null
        : body.goal;

    const experienceLevel =
      body.experienceLevel === "" ||
      body.experienceLevel === null ||
      body.experienceLevel === undefined
        ? null
        : body.experienceLevel;

    const location =
      body.location === "" ||
      body.location === null ||
      body.location === undefined
        ? null
        : body.location;

    if (
      age !== null &&
      (!Number.isFinite(age) || age < 13 || age > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid age." },
        { status: 400 }
      );
    }

    if (
      height !== null &&
      (!Number.isFinite(height) || height <= 0 || height > 300)
    ) {
      return NextResponse.json(
        { error: "Invalid height." },
        { status: 400 }
      );
    }

    if (
      weight !== null &&
      (!Number.isFinite(weight) || weight <= 0 || weight > 500)
    ) {
      return NextResponse.json(
        { error: "Invalid weight." },
        { status: 400 }
      );
    }

    if (
      trainingDays !== null &&
      (!Number.isInteger(trainingDays) ||
        trainingDays < 1 ||
        trainingDays > 7)
    ) {
      return NextResponse.json(
        { error: "Training days must be between 1 and 7." },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        age,
        gender,
        height,
        weight,
        goal,
        experienceLevel,
        trainingDays,
        location,
      },
      create: {
        userId: session.user.id,
        age,
        gender,
        height,
        weight,
        goal,
        experienceLevel,
        trainingDays,
        location,
      },
    });

    if (name !== undefined) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: name || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);

    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}