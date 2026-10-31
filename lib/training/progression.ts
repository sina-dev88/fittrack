
export type ProgressionSet = {
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  rir: number | null;
};

export type ProgressionSession = {
  date: Date;
  sets: ProgressionSet[];
};

export type ProgressionAnalysis = {
  status:
    | "INSUFFICIENT_DATA"
    | "CHECK_DATA"
    | "IMPROVING"
    | "DECLINING"
    | "STABLE";
  recommendation: string;
  latestEstimated1RM: number | null;
  previousEstimated1RM: number | null;
  changePercent: number | null;
  validSetCount: number;
};

function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;

  return reps === 1 ? weight : weight * (1 + reps / 30);
}

function isValidSet(set: ProgressionSet) {
  return (
    set.weight !== null &&
    set.reps !== null &&
    Number.isFinite(set.weight) &&
    Number.isInteger(set.reps) &&
    set.weight > 0 &&
    set.reps >= 1 &&
    set.reps <= 30 &&
    (set.rpe === null ||
      (Number.isFinite(set.rpe) && set.rpe >= 1 && set.rpe <= 10)) &&
    (set.rir === null ||
      (Number.isFinite(set.rir) && set.rir >= 0 && set.rir <= 10))
  );
}

function getSessionEstimate(session: ProgressionSession) {
  const validSets = session.sets.filter(isValidSet);

  if (validSets.length === 0) return null;

  const estimates = validSets.map((set) =>
    estimateOneRepMax(set.weight!, set.reps!),
  );

  return {
    estimated1RM: Math.max(...estimates),
    validSetCount: validSets.length,
  };
}

export function analyzeProgression(
  sessions: ProgressionSession[],
): ProgressionAnalysis {
  const ordered = [...sessions]
    .filter((session) => !Number.isNaN(session.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const latestSession = ordered[0];
  const previousSession = ordered[1];

  const latest = latestSession
    ? getSessionEstimate(latestSession)
    : null;

  const previous = previousSession
    ? getSessionEstimate(previousSession)
    : null;

  const base = {
    latestEstimated1RM: latest?.estimated1RM ?? null,
    previousEstimated1RM: previous?.estimated1RM ?? null,
    validSetCount: latest?.validSetCount ?? 0,
  };

  if (!latest || !previous) {
    return {
      ...base,
      status: "INSUFFICIENT_DATA",
      changePercent: null,
      recommendation:
        "Complete at least two sessions with valid working sets before assessing progress.",
    };
  }

  const previousMax = previous.estimated1RM;
  const latestMax = latest.estimated1RM;

  if (
    !Number.isFinite(previousMax) ||
    !Number.isFinite(latestMax) ||
    previousMax <= 0 ||
    latestMax <= 0
  ) {
    return {
      ...base,
      status: "CHECK_DATA",
      changePercent: null,
      recommendation:
        "Check the recorded weights and reps before comparing performance.",
    };
  }

  const changePercent =
    ((latestMax - previousMax) / previousMax) * 100;

  if (changePercent >= 50 || changePercent <= -33) {
    return {
      ...base,
      status: "CHECK_DATA",
      changePercent: Number(changePercent.toFixed(1)),
      recommendation:
        "An unusually large performance change was detected. Verify the exercise, units, weights and reps before adjusting the plan.",
    };
  }

  if (changePercent > 2.5) {
    return {
      ...base,
      status: "IMPROVING",
      changePercent: Number(changePercent.toFixed(1)),
      recommendation:
        "Estimated strength is improving. Keep the technique consistent and confirm that the performance can be repeated before progressing.",
    };
  }

  if (changePercent < -5) {
    return {
      ...base,
      status: "DECLINING",
      changePercent: Number(changePercent.toFixed(1)),
      recommendation:
        "Performance has decreased. Review recovery, technique, exercise setup and effort before changing the training load.",
    };
  }

  return {
    ...base,
    status: "STABLE",
    changePercent: Number(changePercent.toFixed(1)),
    recommendation:
      "Performance is broadly stable. Maintain the current load and focus on consistent technique and controlled repetitions.",
  };
}


