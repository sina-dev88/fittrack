export function calculateVolume(
  weight: number,
  reps: number
) {
  return weight * reps;
}

export function calculateEstimated1RM(
  weight: number,
  reps: number
) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  if (reps === 1) {
    return weight;
  }

  return weight * (1 + reps / 30);
}
