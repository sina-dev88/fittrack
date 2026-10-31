
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeProgression } from "@/lib/training/progression";
import { NextResponse } from "next/server";

function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        startedAt: true,
        completedAt: true,
        sets: {
          where: {
            status: "COMPLETED",
            workoutExerciseId: { not: null },
          },
          select: {
            weight: true,
            reps: true,
            rpe: true,
            rir: true,
            workoutExercise: {
              select: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    primaryMuscle: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const personalRecords = await prisma.personalRecord.findMany({
      where: { userId },
      orderBy: { achievedAt: "desc" },
      select: {
        exerciseId: true,
        weight: true,
        reps: true,
        estimated1RM: true,
        achievedAt: true,
        exercise: {
          select: {
            name: true,
            primaryMuscle: true,
          },
        },
      },
    });

    type ExerciseSession = {
      workoutId: string;
      workoutName: string;
      date: Date;
      sets: {
        weight: number | null;
        reps: number | null;
        rpe: number | null;
        rir: number | null;
      }[];
      volume: number;
      bestWeight: number;
      bestEstimated1RM: number;
      completedSets: number;
    };

    const exerciseMap = new Map<
      string,
      {
        exerciseId: string;
        name: string;
        primaryMuscle: string;
        sessions: ExerciseSession[];
      }
    >();

    for (const workout of workouts) {
      const grouped = new Map<
        string,
        {
          name: string;
          primaryMuscle: string;
          sets: ExerciseSession["sets"];
        }
      >();

      for (const set of workout.sets) {
        const exercise = set.workoutExercise?.exercise;
        if (!exercise) continue;

        const group = grouped.get(exercise.id) ?? {
          name: exercise.name,
          primaryMuscle: exercise.primaryMuscle,
          sets: [],
        };

        group.sets.push({
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe,
          rir: set.rir,
        });

        grouped.set(exercise.id, group);
      }

      for (const [exerciseId, group] of grouped) {
        const validSets = group.sets.filter(
          (set) =>
            set.weight !== null &&
            set.reps !== null &&
            Number.isFinite(set.weight) &&
            Number.isInteger(set.reps) &&
            set.weight > 0 &&
            set.reps > 0 &&
            set.reps <= 30,
        );

        const volume = validSets.reduce(
          (sum, set) => sum + set.weight! * set.reps!,
          0,
        );

        const bestWeight = validSets.reduce(
          (best, set) => Math.max(best, set.weight!),
          0,
        );

        const bestEstimated1RM = validSets.reduce(
          (best, set) =>
            Math.max(
              best,
              estimateOneRepMax(set.weight!, set.reps!),
            ),
          0,
        );

        const exercise = exerciseMap.get(exerciseId) ?? {
          exerciseId,
          name: group.name,
          primaryMuscle: group.primaryMuscle,
          sessions: [],
        };

        exercise.sessions.push({
          workoutId: workout.id,
          workoutName: workout.name,
          date: workout.completedAt!,
          sets: validSets,
          volume,
          bestWeight,
          bestEstimated1RM,
          completedSets: validSets.length,
        });

        exerciseMap.set(exerciseId, exercise);
      }
    }

    const exercises = Array.from(exerciseMap.values()).map(
      (exercise) => {
        const orderedSessions = [...exercise.sessions].sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        );

        const latest = orderedSessions[0];
        const previous = orderedSessions[1];

        const analysis = analyzeProgression(
          orderedSessions.map((item) => ({
            date: item.date,
            sets: item.sets,
          })),
        );

        const records = personalRecords.filter(
          (record) => record.exerciseId === exercise.exerciseId,
        );

        return {
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          primaryMuscle: exercise.primaryMuscle,
          sessionCount: orderedSessions.length,
          latest: latest ?? null,
          previous: previous ?? null,
          estimated1RMChangePercent: analysis.changePercent,
          personalRecord: records[0] ?? null,
          progression: {
            status: analysis.status,
            recommendation: analysis.recommendation,
            latestEstimated1RM: analysis.latestEstimated1RM,
            previousEstimated1RM: analysis.previousEstimated1RM,
            validSetCount: analysis.validSetCount,
          },
          recommendation: analysis.recommendation,
        };
      },
    );

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      completedWorkoutCount: workouts.length,
      exerciseCount: exercises.length,
      exercises,
    });
  } catch (error) {
    console.error("Exercise progress API error:", error);

    return NextResponse.json(
      { error: "Could not load exercise performance." },
      { status: 500 },
    );
  }
}

