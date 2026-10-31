
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 120;

const localAI = createOpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "lm-studio",
});

const SYSTEM_PROMPT = `
You are FitTrack AI Coach, a fitness assistant inside the FitTrack app.

Your responsibilities:
- Help users with workouts, exercise technique, training plans,
  progressive overload, recovery, sleep, and general nutrition.
- Give practical, concise, supportive, evidence-informed answers.
- Use the user's FitTrack context when it is available.
- Ask a short clarifying question when important information is missing.
- Never pretend to know user data that is not provided.
- Do not diagnose medical conditions or injuries.
- Do not prescribe medication, steroids, or other drugs.
- Do not recommend extreme dieting or dangerous training.
- Recommend a qualified healthcare professional for medical concerns.
- Stay focused on fitness and FitTrack-related questions.
- Respond in the same language as the user's latest message.
- Be transparent about uncertainty and your limitations.
`;

async function getFitTrackContext(userId: string) {
  const [user, workouts, records, habits, achievements] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      prisma.workout.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.personalRecord.count({
        where: { userId },
      }),
      prisma.habit.count({
        where: { userId, isActive: true },
      }),
      prisma.userAchievement.count({
        where: { userId },
      }),
    ]);

  return `
FitTrack user context:
- Name: ${user?.name ?? "Not provided"}
- Completed workouts: ${workouts}
- Personal records: ${records}
- Active habits: ${habits}
- Unlocked achievements: ${achievements}

Use these facts when relevant. Do not invent other personal data.
`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to use AI Coach." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Please send a message." },
        { status: 400 },
      );
    }

    if (messages.length > 40) {
      return NextResponse.json(
        { error: "Please start a new chat to continue." },
        { status: 400 },
      );
    }

    const context = await getFitTrackContext(session.user.id);

    const result = streamText({
      model: localAI.chat("qwen2.5-coder-0.5b-instruct"),
      system: `${SYSTEM_PROMPT}\n\n${context}`,
      messages,
      temperature: 0.7,
      maxOutputTokens: 700,
      onError({ error }) {
        console.error("Local AI Coach streaming error:", error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("POST /api/ai-coach error:", error);

    return NextResponse.json(
      {
        error:
          "AI Coach could not respond. Check that LM Studio is running and the model is loaded.",
      },
      { status: 500 },
    );
  }
}