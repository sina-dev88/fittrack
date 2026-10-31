import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  MUSCLE_REGION_MAP,
  scoreExerciseForRegion,
} from "@/lib/anatomy/muscle-region-map";

type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Quadriceps"
  | "Hamstrings"
  | "Glutes"
  | "Biceps"
  | "Triceps"
  | "Core"
  | "Calves";

type ExerciseRecord = {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  difficulty: string | null;
};

type RecentPerformance = {
  estimated1RM: number;
  achievedAt: Date;
};

type GeneratedExercise = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
};

type GeneratedDay = {
  name: string;
  dayNumber: number;
  exercises: GeneratedExercise[];
};

const SPLITS: Record<number, { name: string; muscles: MuscleGroup[] }[]> = {
  2: [
    {
      name: "Full Body A",
      muscles: [
        "Chest",
        "Back",
        "Quadriceps",
        "Shoulders",
        "Biceps",
        "Triceps",
      ],
    },
    {
      name: "Full Body B",
      muscles: ["Back", "Chest", "Hamstrings", "Glutes", "Calves", "Core"],
    },
  ],

  3: [
    { name: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    // Keep hamstrings on Legs day in the 3-day split. This avoids prescribing
    // another direct hamstring movement on Pull day before the next leg session.
    { name: "Pull", muscles: ["Back", "Biceps"] },
    {
      name: "Legs & Core",
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
    },
  ],

  4: [
    {
      name: "Upper A",
      muscles: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"],
    },
    {
      name: "Lower A",
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
    },
    {
      name: "Upper B",
      muscles: ["Back", "Chest", "Shoulders", "Biceps", "Triceps"],
    },
    {
      name: "Lower B",
      muscles: ["Hamstrings", "Quadriceps", "Glutes", "Calves", "Core"],
    },
  ],

  5: [
    { name: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { name: "Pull", muscles: ["Back", "Biceps"] },
    {
      name: "Legs",
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
    },
    { name: "Upper Body", muscles: ["Chest", "Back", "Shoulders"] },
    {
      name: "Lower Body & Arms",
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Biceps", "Triceps"],
    },
  ],

  6: [
    { name: "Push A", muscles: ["Chest", "Shoulders", "Triceps"] },
    { name: "Pull A", muscles: ["Back", "Biceps"] },
    {
      name: "Legs A",
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
    },
    { name: "Push B", muscles: ["Chest", "Shoulders", "Triceps"] },
    { name: "Pull B", muscles: ["Back", "Biceps"] },
    {
      name: "Legs B",
      muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
    },
  ],
};

function normalizeMuscle(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[‐‑‒–—_-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsTerm(value: string, term: string) {
  const normalizedValue = normalizeMuscle(value);
  const normalizedTerm = normalizeMuscle(term);
  if (!normalizedValue || !normalizedTerm) return false;
  return (
    normalizedValue === normalizedTerm ||
    normalizedValue.startsWith(`${normalizedTerm} `) ||
    normalizedValue.endsWith(` ${normalizedTerm}`) ||
    normalizedValue.includes(` ${normalizedTerm} `)
  );
}

function matchesMuscle(exercise: ExerciseRecord, muscle: MuscleGroup) {
  const exerciseName = normalizeMuscle(exercise.name);

  // These records have historically been stored under broad labels (Biceps / Calves).
  // Guard by name as well as category so legacy database rows cannot reintroduce
  // wrist curls as the main biceps exercise or ankle drills as calf raises.
  if (
    muscle === "Biceps" &&
    /\b(seated wrist curl|reverse wrist curl|reverse curl)\b/.test(exerciseName)
  ) {
    return false;
  }

  if (
    muscle === "Calves" &&
    /\b(tibialis raise|ankle eversion|ankle inversion|peroneal raise)\b/.test(exerciseName)
  ) {
    return false;
  }

  // Include common anatomical aliases so sub-region-tagged records remain
  // eligible for the existing broad workout splits.
  const aliases: Record<MuscleGroup, string[]> = {
    Chest: [
      "chest", "pectorals", "pecs", "pectoralis", "pectoralis major",
      "upper chest", "mid chest", "middle chest", "lower chest", "serratus anterior",
    ],
    Back: [
      "back", "lats", "latissimus", "latissimus dorsi", "traps", "trapezius",
      "rhomboids", "rhomboid", "erector spinae", "spinal erectors", "back extensors",
      "multifidus", "quadratus lumborum", "lower back", "lumbar", "levator scapulae",
      "serratus posterior superior", "serratus posterior inferior", "infraspinatus",
      "teres minor", "teres major", "rotator cuff",
    ],
    Shoulders: [
      "shoulders", "shoulder", "delts", "deltoid", "deltoids", "front delts",
      "side delts", "rear delts", "anterior deltoid", "lateral deltoid", "posterior deltoid",
    ],
    Quadriceps: ["quadriceps", "quad", "quads", "rectus femoris", "vastus lateralis", "vastus medialis"],
    Hamstrings: ["hamstrings", "hamstring", "biceps femoris", "semitendinosus", "semimembranosus", "posterior thigh", "adductor magnus", "gracilis"],
    Glutes: ["glutes", "glute", "gluteals", "gluteus", "gluteus maximus", "gluteus medius", "piriformis"],
    // Keep forearm-only movements out of the broad Biceps target. They remain
    // available in the anatomy explorer and can be added manually to a plan.
    Biceps: ["biceps", "bicep", "biceps brachii", "brachialis"],
    Triceps: ["triceps", "tricep", "triceps long head", "triceps lateral head", "triceps medial head", "anconeus"],
    Core: ["core", "abs", "abdominals", "abdominal", "rectus abdominis", "obliques", "external oblique", "multifidus", "quadratus lumborum"],
    // Tibialis/peroneal/ankle-control drills are lower-leg anatomy, but they
    // should not replace a calf-raise pattern in an ordinary Legs workout.
    Calves: ["calves", "calf", "gastrocnemius", "soleus", "plantaris"],
  };

  const terms = aliases[muscle];
  const primary = normalizeMuscle(exercise.primaryMuscle);
  if (terms.some((term) => containsTerm(primary, term))) return true;

  const secondary = (exercise.secondaryMuscles ?? "")
    .split(/[,;|]/)
    .map(normalizeMuscle)
    .filter(Boolean);

  return secondary.some((item) => terms.some((term) => containsTerm(item, term)));
}

function equipmentAllowed(exercise: ExerciseRecord, location: string) {
  if (location === "GYM") return true;

  const equipment = normalizeMuscle(exercise.equipment);

  const homeEquipment = [
    "bodyweight",
    "none",
    "mat",
    "dumbbells",
    "dumbbell",
    "resistance bands",
    "resistance band",
    "pull up bar",
    "pull-up bar",
    "bench",
    "chair",
    "wall",
    "towel",
  ];

  if (location === "HOME") {
    return homeEquipment.some((item) => normalizeMuscle(item) === equipment);
  }

  // BOTH: allow exercises usable at home or in a gym.
  return true;
}

function getTargets(goal: string, experience: string) {
  if (goal === "STRENGTH") {
    return {
      sets: experience === "BEGINNER" ? 3 : 4,
      reps: 6,
    };
  }

  if (goal === "ENDURANCE") {
    return { sets: 3, reps: 15 };
  }

  return {
    sets: experience === "BEGINNER" ? 3 : 4,
    reps: goal === "FAT_LOSS" ? 12 : 10,
  };
}

type RegionAwareMuscle = MuscleGroup;

const REGIONS_BY_MUSCLE: Record<RegionAwareMuscle, string[]> = {
  Chest: ["chest-upper", "chest-mid", "chest-lower", "serratus-anterior"],
  Back: [
    "trapezius-upper", "trapezius-mid", "trapezius-lower",
    "infraspinatus", "teres-minor", "teres-major",
    "lats-upper", "lats-mid", "lats-lower", "rhomboids",
    "erector-spinae", "multifidus", "quadratus-lumborum",
    "levator-scapulae", "serratus-posterior-superior", "serratus-posterior-inferior",
  ],
  Shoulders: ["front-deltoid", "side-deltoid", "rear-deltoid"],
  Quadriceps: ["rectus-femoris", "vastus-lateralis", "vastus-medialis"],
  Hamstrings: ["biceps-femoris", "semitendinosus", "semimembranosus", "adductor-magnus", "gracilis"],
  Glutes: ["gluteus-medius", "gluteus-maximus", "piriformis"],
  Biceps: ["biceps-brachii", "brachialis", "brachioradialis"],
  Triceps: ["triceps-long-head", "triceps-lateral-head", "triceps-medial-head", "anconeus"],
  Core: ["rectus-abdominis-upper", "rectus-abdominis-lower", "external-oblique", "multifidus", "quadratus-lumborum"],
  Calves: ["gastrocnemius-lateral", "gastrocnemius-medial", "soleus", "tibialis-anterior", "popliteus", "peroneals", "tibialis-posterior", "plantaris"],
};

function normalizeExerciseName(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[‐‑‒–—_-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Prefers named movements from the anatomy region catalog while keeping
 * broadly tagged legacy exercises eligible as a fallback.
 */
const GENERIC_REGION_TERMS = new Set([
  "chest", "pectorals", "pecs", "pectoralis major", "shoulders", "delts",
  "deltoids", "arms", "upper arms", "forearms", "core", "abs", "abdominals",
  "abdominal", "legs", "lower body", "quadriceps", "quads", "hamstrings",
  "biceps", "bicep", "triceps", "back", "lats", "latissimus dorsi", "traps",
  "trapezius", "rhomboids", "glutes", "gluteals", "gluteal muscles", "calves",
  "calf", "gastrocnemius", "soleus", "tibialis", "rotator cuff", "external rotators",
  "peroneals", "fibularis longus", "peroneus longus",
]);

function listedMovementMatches(exerciseName: string, listedName: string) {
  const candidate = normalizeExerciseName(exerciseName);
  const listed = normalizeExerciseName(listedName);
  if (!candidate || !listed) return false;
  if (candidate === listed || candidate.includes(listed)) return true;

  // Permit useful naming variations such as "Overhead Dumbbell Triceps Extension"
  // matching catalog entry "Overhead Dumbbell Extension", but avoid one-word matches.
  const words = listed.split(" ").filter(Boolean);
  if (words.length < 2) return false;
  const candidateWords = candidate.split(" ");
  let cursor = 0;
  for (const word of words) {
    const nextIndex = candidateWords.indexOf(word, cursor);
    if (nextIndex < 0) return false;
    cursor = nextIndex + 1;
  }
  return true;
}

function specificRegionMatchLevel(exercise: ExerciseRecord, regionId: string) {
  const region = MUSCLE_REGION_MAP[regionId];
  if (!region) return 0;
  const exerciseName = normalizeExerciseName(exercise.name);

  if (region.exercises.some((name: string) => listedMovementMatches(exerciseName, name))) {
    return 55;
  }

  const specificTermMatch = region.matchTerms.some((term: string) => {
    const normalizedTerm = normalizeExerciseName(term);
    return (
      normalizedTerm.length >= 8 &&
      !GENERIC_REGION_TERMS.has(normalizedTerm) &&
      containsTerm(exerciseName, normalizedTerm)
    );
  });

  return specificTermMatch ? 28 : 0;
}

function directlyMatchedRegions(exercise: ExerciseRecord) {
  return Object.keys(MUSCLE_REGION_MAP).filter(
    (regionId) => specificRegionMatchLevel(exercise, regionId) >= 28,
  );
}

/**
 * Prefer catalogued movements for regions that have not yet been trained
 * during this session or week. Generic legacy records remain eligible but
 * do not falsely count as coverage for every sub-region.
 */
function regionalExerciseScore(
  exercise: ExerciseRecord,
  muscle: RegionAwareMuscle,
  dayRegionUseCounts: Map<string, number>,
  weeklyRegionUseCounts: Map<string, number>,
) {
  let bestScore = 0;

  for (const regionId of REGIONS_BY_MUSCLE[muscle] ?? []) {
    const specificScore = specificRegionMatchLevel(exercise, regionId);
    if (specificScore > 0) {
      const dayUses = dayRegionUseCounts.get(regionId) ?? 0;
      const weekUses = weeklyRegionUseCounts.get(regionId) ?? 0;
      const novelty = (dayUses === 0 ? 18 : -12 * dayUses) + (weekUses === 0 ? 10 : -4 * weekUses);
      bestScore = Math.max(bestScore, specificScore + novelty);
      continue;
    }

    // Compatibility fallback for broad/legacy records. This keeps them
    // selectable, but below movements with a known regional association.
    if (scoreExerciseForRegion(exercise, regionId) > 0) {
      bestScore = Math.max(bestScore, 4);
    }
  }

  return bestScore;
}

/**
 * Classifies an exercise by its main movement pattern. It is deliberately based
 * on normalized names because the current Exercise model has no movementFamily
 * column. The ordering matters: leg curls must be recognized before generic curls.
 */
function movementFamily(exerciseName: string) {
  const name = normalizeExerciseName(exerciseName);

  if (/\b(leg extension|knee extension)\b/.test(name)) return "knee-extension";
  if (/\b(leg curl|nordic curl|hamstring curl)\b/.test(name)) return "knee-flexion";
  if (/\b(calf raise|tibialis raise|ankle eversion|ankle inversion|peroneal raise)\b/.test(name)) return "ankle";
  if (/\b(squat|split squat|bulgarian split squat|lunge|leg press)\b/.test(name)) return "squat";
  if (/\b(romanian deadlift|deadlift|hip thrust|glute bridge|back extension|good morning)\b/.test(name)) return "hinge-extension";
  if (/\b(bench press|dumbbell press|shoulder press|overhead press|push up|pushup|dip)\b/.test(name)) return "press";
  if (/\b(fly|flies)\b/.test(name)) return "fly";
  if (/\b(row|rowing|face pull)\b/.test(name)) return "row";
  if (/\b(pulldown|pull up|pullup|chin up|chinup|pullover)\b/.test(name)) return "vertical-pull";
  if (/\b(lateral raise|y raise|front raise|rear delt raise|reverse dumbbell fly|shrug)\b/.test(name)) return "raise";
  if (/\b(pushdown|triceps extension|triceps kickback)\b/.test(name)) return "triceps-isolation";
  if (/\b(wrist curl|reverse curl|hammer curl|incline dumbbell curl|dumbbell curl|barbell curl|curl)\b/.test(name)) return "curl";
  if (/\b(plank|dead bug|bird dog|pallof press|crunch|knee raise|side plank)\b/.test(name)) return "core-stability";

  return "other";
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        days: {
          orderBy: { dayNumber: "asc" },
          select: {
            id: true,
            name: true,
            dayNumber: true,
          },
        },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/workout-plans error:", error);
    return errorResponse("Failed to load workout plans.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Invalid request body.");
    }

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const mode = String(body.mode ?? "manual");

    if (!name || name.length > 100) {
      return errorResponse("Enter a plan name of up to 100 characters.");
    }

    if (description.length > 1000) {
      return errorResponse("Description cannot exceed 1000 characters.");
    }

    /*
     * CONFIRM
     * Validate the proposed exercises and save the approved plan.
     */
    if (mode === "confirm") {
      const days = body.days;

      if (!Array.isArray(days) || days.length < 2 || days.length > 6) {
        return errorResponse(
          "The proposed plan must contain 2 to 6 workout days.",
        );
      }

      const normalizedDays: GeneratedDay[] = (days as unknown[]).map(
        (dayValue: unknown, dayIndex: number): GeneratedDay => {
          const day =
            typeof dayValue === "object" &&
            dayValue !== null &&
            !Array.isArray(dayValue)
              ? (dayValue as Record<string, unknown>)
              : {};

          const rawExercises = day.exercises;
          const exercises = Array.isArray(rawExercises)
            ? (rawExercises as unknown[])
            : [];

          return {
            name: String(day.name ?? "").trim(),
            dayNumber: dayIndex + 1,
            exercises: exercises.map((exerciseValue, exerciseIndex) => {
              const exercise =
                typeof exerciseValue === "object" &&
                exerciseValue !== null &&
                !Array.isArray(exerciseValue)
                  ? (exerciseValue as Record<string, unknown>)
                  : {};

              return {
                exerciseId: String(
                  exercise.exerciseId ?? exercise.id ?? "",
                ).trim(),
                order: exerciseIndex + 1,
                targetSets: Number(exercise.targetSets),
                targetReps: Number(exercise.targetReps),
              };
            }),
          };
        },
      );

      const invalidDay = normalizedDays.some(
        (day) =>
          !day.name ||
          day.name.length > 100 ||
          day.exercises.length === 0 ||
          day.exercises.length > 12 ||
          day.exercises.some(
            (exercise) =>
              !exercise.exerciseId ||
              !Number.isInteger(exercise.targetSets) ||
              exercise.targetSets < 1 ||
              exercise.targetSets > 10 ||
              !Number.isInteger(exercise.targetReps) ||
              exercise.targetReps < 1 ||
              exercise.targetReps > 30,
          ),
      );

      if (invalidDay) {
        return errorResponse(
          "The proposed plan contains invalid days or exercises.",
        );
      }

      const exerciseIds = [
        ...new Set(
          normalizedDays.flatMap((day) =>
            day.exercises.map((exercise) => exercise.exerciseId),
          ),
        ),
      ];

      const existingExercises = await prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
        select: { id: true },
      });

      if (existingExercises.length !== exerciseIds.length) {
        return errorResponse(
          "One or more exercises no longer exist. Generate the plan again.",
        );
      }

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: session.user.id,
          name,
          description:
            description || "Approved workout plan generated by FitTrack.",
          days: {
            create: normalizedDays.map((day) => ({
              name: day.name,
              dayNumber: day.dayNumber,
              exercises: {
                create: day.exercises.map((exercise) => ({
                  exerciseId: exercise.exerciseId,
                  order: exercise.order,
                  targetSets: exercise.targetSets,
                  targetReps: exercise.targetReps,
                })),
              },
            })),
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          days: {
            orderBy: { dayNumber: "asc" },
            select: {
              id: true,
              name: true,
              dayNumber: true,
              exercises: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  order: true,
                  targetSets: true,
                  targetReps: true,
                  exercise: {
                    select: {
                      id: true,
                      name: true,
                      primaryMuscle: true,
                      equipment: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json(plan, { status: 201 });
    }

    /*
     * MANUAL
     * Preserve the existing manual plan creation behavior.
     */
    if (mode !== "generate" && mode !== "preview") {
      const days = Array.isArray(body.days) ? body.days : [];

      if (days.length === 0 || days.length > 20) {
        return errorResponse("Add between 1 and 20 workout days.");
      }

      const normalizedDays = days.map(
        (day: { name?: unknown }, index: number) => ({
          name: String(day?.name ?? "").trim(),
          dayNumber: index + 1,
        }),
      );

      if (
        normalizedDays.some(
          (day: { name: string; dayNumber: number }) =>
            !day.name || day.name.length > 100,
        )
      ) {
        return errorResponse("Each workout day must have a valid name.");
      }

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: session.user.id,
          name,
          description: description || null,
          days: {
            create: normalizedDays,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          days: {
            orderBy: { dayNumber: "asc" },
            select: {
              id: true,
              name: true,
              dayNumber: true,
            },
          },
        },
      });

      return NextResponse.json(plan, { status: 201 });
    }

    /*
     * GENERATE / PREVIEW
     * Read the profile defaults and create the proposed split.
     */
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        goal: true,
        experienceLevel: true,
        trainingDays: true,
        location: true,
      },
    });

    const goal = String(body.goal ?? profile?.goal ?? "GENERAL_FITNESS");

    const experience = String(
      body.experienceLevel ?? profile?.experienceLevel ?? "BEGINNER",
    );

    const location = String(body.location ?? profile?.location ?? "GYM");

    const requestedDays = Number(
      body.trainingDays ?? profile?.trainingDays ?? 3,
    );

    if (
      ![
        "MUSCLE_GAIN",
        "FAT_LOSS",
        "STRENGTH",
        "MAINTENANCE",
        "GENERAL_FITNESS",
        "ENDURANCE",
      ].includes(goal)
    ) {
      return errorResponse("Invalid training goal.");
    }

    if (!["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(experience)) {
      return errorResponse("Invalid experience level.");
    }

    if (!["GYM", "HOME", "BOTH"].includes(location)) {
      return errorResponse("Invalid training location.");
    }

    if (
      !Number.isInteger(requestedDays) ||
      requestedDays < 2 ||
      requestedDays > 6
    ) {
      return errorResponse("Choose between 2 and 6 training days per week.");
    }

    const split = SPLITS[requestedDays];

    const allExercises = (await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        primaryMuscle: true,
        secondaryMuscles: true,
        equipment: true,
        difficulty: true,
      },
      orderBy: { name: "asc" },
    })) as ExerciseRecord[];

    const availableExercises = allExercises.filter((exercise) =>
      equipmentAllowed(exercise, location),
    );

    if (availableExercises.length < 3) {
      return errorResponse(
        "Your exercise library is too small to generate a plan. Add more exercises first.",
      );
    }

    const baseTargets = getTargets(goal, experience);

    /*
     * Recent personal records.
     * Preserve the original conservative rep-target adjustment.
     */
    const recentRecords = await prisma.personalRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { achievedAt: "desc" },
      take: 300,
      select: {
        exerciseId: true,
        estimated1RM: true,
        achievedAt: true,
      },
    });

    const performanceByExercise = new Map<string, RecentPerformance[]>();

    for (const record of recentRecords) {
      const history = performanceByExercise.get(record.exerciseId) ?? [];

      if (history.length < 2) {
        history.push({
          estimated1RM: Number(record.estimated1RM ?? 0),
          achievedAt: record.achievedAt,
        });

        performanceByExercise.set(record.exerciseId, history);
      }
    }

    function getExerciseTargets(exercise: ExerciseRecord) {
      const history = performanceByExercise.get(exercise.id) ?? [];

      let reps = baseTargets.reps;

      if (history.length >= 2) {
        const latest = history[0].estimated1RM;
        const previous = history[1].estimated1RM;

        if (latest > 0 && previous > 0) {
          const ratio = latest / previous;

          // Adjust repetitions conservatively; never prescribe heavier loads here.
          if (ratio >= 1.025 && ratio < 1.15) {
            reps = Math.min(baseTargets.reps + 1, 15);
          }
        }
      }

      return {
        sets: baseTargets.sets,
        reps,
      };
    }

    /*
     * Exercise selection.
     * Preserve scoring by muscle relevance, difficulty, variety
     * and compound-movement preference.
     */
    const weeklyExerciseUseCounts = new Map<string, number>();
    const weeklyRegionUseCounts = new Map<string, number>();

    const generatedDays: GeneratedDay[] = split.map((day, dayIndex) => {
      const selected: ExerciseRecord[] = [];
      const selectedIds = new Set<string>();
      const primaryMuscleCounts = new Map<string, number>();
      const dayRegionUseCounts = new Map<string, number>();

      const maxExercises = Math.min(6, Math.max(experience === "BEGINNER" ? 4 : 6, day.muscles.length));

      function recordSelectedExercise(exercise: ExerciseRecord) {
        for (const regionId of directlyMatchedRegions(exercise)) {
          dayRegionUseCounts.set(regionId, (dayRegionUseCounts.get(regionId) ?? 0) + 1);
          weeklyRegionUseCounts.set(regionId, (weeklyRegionUseCounts.get(regionId) ?? 0) + 1);
        }
      }

      function preferUnusedWeeklyExercises(candidates: ExerciseRecord[]) {
        const unused = candidates.filter((exercise) => !weeklyExerciseUseCounts.has(exercise.id));
        return unused.length > 0 ? unused : candidates;
      }

      function scoreExercise(exercise: ExerciseRecord, muscle: MuscleGroup) {
        let score = 0;

        const primary = normalizeMuscle(exercise.primaryMuscle);

        const difficulty = normalizeMuscle(exercise.difficulty);
        const family = movementFamily(exercise.name);

        if (primary === normalizeMuscle(muscle)) {
          score += 100;
        } else if (matchesMuscle(exercise, muscle)) {
          score += 45;
        }

        score += regionalExerciseScore(
          exercise,
          muscle,
          dayRegionUseCounts,
          weeklyRegionUseCounts,
        );
        const priorWeeklyUses = weeklyExerciseUseCounts.get(exercise.id) ?? 0;
        score -= priorWeeklyUses * 38;

        if (difficulty === "beginner") {
          score += experience === "BEGINNER" ? 30 : 5;
        } else if (difficulty === "intermediate") {
          score += experience === "INTERMEDIATE" ? 30 : 15;
        } else if (difficulty === "advanced") {
          score += experience === "ADVANCED" ? 30 : -100;
        }

        if (selectedIds.has(exercise.id)) {
          score -= 1000;
        }

        // Prefer compound movements early in the session.
        const isolationNames = [
          "curl",
          "fly",
          "pushdown",
          "lateral raise",
          "leg extension",
          "leg curl",
          "reverse crunch",
        ];

        const isIsolation = isolationNames.some((term) =>
          exercise.name.toLowerCase().includes(term),
        );

        if (selected.length < 2 && !isIsolation) {
          score += 10;
        }

        // Encourage variety: don't fill a session with near-identical movement
        // patterns (for example, several presses or several squat variations).
        const familyCount = selected.filter(
          (item) => movementFamily(item.name) === family,
        ).length;
        if (family !== "other") {
          score -= familyCount * 32;
        }

        const normalizedName = normalizeExerciseName(exercise.name);

        // Back extensions and trunk-stability drills are useful accessories,
        // but should not outrank rows/pulldowns as the main Pull-day back work.
        if (
          muscle === "Back" &&
          /\b(back extension|bird dog|prone y raise)\b/.test(normalizedName)
        ) {
          score -= 32;
        }
        if (
          muscle === "Back" &&
          /\b(row|pulldown|pull up|pullup|chin up|chinup)\b/.test(normalizedName)
        ) {
          score += 12;
        }

        // Legacy labels should not allow shin/ankle work to win a calf slot.
        if (
          muscle === "Calves" &&
          /\b(tibialis|ankle eversion|ankle inversion|peroneal)\b/.test(normalizedName)
        ) {
          score -= 100;
        }

        // Reduce excessive concentration on one primary muscle.
        score -= (primaryMuscleCounts.get(primary) ?? 0) * 20;

        return score;
      }

      // First choose a suitable exercise for each target muscle.
      for (const muscle of day.muscles) {
        if (selected.length >= maxExercises) break;

        const eligible = availableExercises.filter(
          (exercise) =>
            !selectedIds.has(exercise.id) &&
            matchesMuscle(exercise, muscle) &&
            (experience === "ADVANCED" ||
              normalizeMuscle(exercise.difficulty) !== "advanced"),
        );
        const candidates = preferUnusedWeeklyExercises(eligible).sort(
          (a, b) => scoreExercise(b, muscle) - scoreExercise(a, muscle),
        );

        const candidate = candidates[0];

        if (candidate) {
          selected.push(candidate);
          selectedIds.add(candidate.id);
          recordSelectedExercise(candidate);

          const primary = normalizeMuscle(candidate.primaryMuscle);

          primaryMuscleCounts.set(
            primary,
            (primaryMuscleCounts.get(primary) ?? 0) + 1,
          );
        }
      }

      // Fill remaining slots only with relevant movements.
      while (selected.length < maxExercises) {
        const eligible = availableExercises.filter(
          (exercise) =>
            !selectedIds.has(exercise.id) &&
            (experience === "ADVANCED" ||
              normalizeMuscle(exercise.difficulty) !== "advanced") &&
            day.muscles.some((muscle) => matchesMuscle(exercise, muscle)),
        );
        const candidates = preferUnusedWeeklyExercises(eligible).sort((a, b) => {
          const scoreA = day.muscles.reduce(
            (sum, muscle) => sum + scoreExercise(a, muscle),
            0,
          );

          const scoreB = day.muscles.reduce(
            (sum, muscle) => sum + scoreExercise(b, muscle),
            0,
          );

          return scoreB - scoreA;
        });

        const candidate = candidates[0];

        if (!candidate) break;

        selected.push(candidate);
        selectedIds.add(candidate.id);
        recordSelectedExercise(candidate);

        const primary = normalizeMuscle(candidate.primaryMuscle);

        primaryMuscleCounts.set(
          primary,
          (primaryMuscleCounts.get(primary) ?? 0) + 1,
        );
      }

      for (const exercise of selected) {
        weeklyExerciseUseCounts.set(
          exercise.id,
          (weeklyExerciseUseCounts.get(exercise.id) ?? 0) + 1,
        );
      }

      return {
        name: day.name,
        dayNumber: dayIndex + 1,
        exercises: selected.map((exercise, index) => {
          const targets = getExerciseTargets(exercise);

          return {
            exerciseId: exercise.id,
            order: index + 1,
            targetSets: targets.sets,
            targetReps: targets.reps,
          };
        }),
      };
    });

    if (generatedDays.some((day) => day.exercises.length === 0)) {
      return errorResponse(
        "Not enough suitable exercises were found. Add more exercises for the target muscle groups.",
      );
    }

    const finalDescription =
      description ||
      `Generated ${goal.toLowerCase().replaceAll("_", " ")} plan for ${requestedDays} days per week. Level: ${experience.toLowerCase()}.`;

    /*
     * PREVIEW
     * Return exercise details without writing to the database.
     */
    if (mode === "preview") {
      const exerciseMap = new Map(
        availableExercises.map((exercise) => [exercise.id, exercise]),
      );

      return NextResponse.json({
        name,
        description: finalDescription,
        goal,
        experienceLevel: experience,
        location,
        trainingDays: requestedDays,
        days: generatedDays.map((day) => ({
          name: day.name,
          dayNumber: day.dayNumber,
          exercises: day.exercises.map((exercise) => {
            const details = exerciseMap.get(exercise.exerciseId);

            return {
              ...exercise,
              name: details?.name ?? "Exercise",
              primaryMuscle: details?.primaryMuscle ?? "",
              equipment: details?.equipment ?? null,
              // Returned for verification/debugging; existing UI can ignore it.
              matchedRegions: details
                ? directlyMatchedRegions(details).map((regionId) => ({
                    id: regionId,
                    name: MUSCLE_REGION_MAP[regionId]?.name ?? regionId,
                    view: MUSCLE_REGION_MAP[regionId]?.view ?? "front",
                  }))
                : [],
            };
          }),
        })),
      });
    }

    /*
     * GENERATE
     * Preserve the original direct-save behavior.
     */
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: session.user.id,
        name,
        description: finalDescription,
        days: {
          create: generatedDays.map((day) => ({
            name: day.name,
            dayNumber: day.dayNumber,
            exercises: {
              create: day.exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                order: exercise.order,
                targetSets: exercise.targetSets,
                targetReps: exercise.targetReps,
              })),
            },
          })),
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        days: {
          orderBy: { dayNumber: "asc" },
          select: {
            id: true,
            name: true,
            dayNumber: true,
            exercises: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                order: true,
                targetSets: true,
                targetReps: true,
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    primaryMuscle: true,
                    equipment: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST /api/workout-plans error:", error);

    return NextResponse.json(
      { error: "Failed to create workout plan." },
      { status: 500 },
    );
  }
}
