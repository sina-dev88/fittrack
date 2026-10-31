import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          FitTrack
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Let&apos;s build your fitness profile
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          A few quick questions will help us personalize your workouts,
          progress tracking, and future AI coaching.
        </p>
      </div>

      <OnboardingForm />
    </main>
  );
}