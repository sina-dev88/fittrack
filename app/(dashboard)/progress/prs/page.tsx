import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PersonalRecordsContent from "@/components/records/PersonalRecordsContent";

export default async function PersonalRecordsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const records = await prisma.personalRecord.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      estimated1RM: "desc",
    },
    select: {
      id: true,
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

  return <PersonalRecordsContent records={records} />;
}