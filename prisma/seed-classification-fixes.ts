import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Applies the same corrected labels used by the updated seed.ts, but only to
 * these named records. Safe to rerun and does not delete or recreate exercises.
 */
const corrections = [
  {
    name: "Prone Y Raise",
    primaryMuscle: "Trapezius",
    secondaryMuscles: "Shoulders, Lower Traps",
  },
  {
    name: "Back Extension",
    primaryMuscle: "Erector Spinae",
    secondaryMuscles: "Glutes, Hamstrings, Core",
  },
  {
    name: "Reverse Curl",
    primaryMuscle: "Forearms",
    secondaryMuscles: "Brachioradialis, Wrist Extensors",
  },
  {
    name: "Seated Wrist Curl",
    primaryMuscle: "Forearms",
    secondaryMuscles: "Wrist Flexors",
  },
  {
    name: "Reverse Wrist Curl",
    primaryMuscle: "Forearms",
    secondaryMuscles: "Wrist Extensors",
  },
  {
    name: "Tibialis Raise",
    primaryMuscle: "Tibialis Anterior",
    secondaryMuscles: "Shin Muscles",
  },
  {
    name: "Band Ankle Eversion",
    primaryMuscle: "Peroneals",
    secondaryMuscles: "Ankle Evertors",
  },
];

async function main() {
  for (const correction of corrections) {
    const { name, ...data } = correction;
    const result = await prisma.exercise.updateMany({
      where: { name },
      data,
    });

    if (result.count === 0) {
      console.warn(`Skipped "${name}" because it is not in the exercise library yet.`);
    } else {
      console.log(`Updated "${name}" (${result.count} record(s)).`);
    }
  }

  console.log("Exercise classification corrections completed.");
}

main()
  .catch((error) => {
    console.error("Failed to apply exercise classification corrections:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
