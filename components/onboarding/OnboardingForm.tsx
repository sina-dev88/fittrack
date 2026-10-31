"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  "Goal",
  "Experience",
  "Training Days",
  "Location",
  "Body Stats",
];

const goals = [
  {
    value: "MUSCLE_GAIN",
    title: "Muscle Gain",
    description: "Build muscle and increase size",
  },
  {
    value: "FAT_LOSS",
    title: "Fat Loss",
    description: "Reduce body fat while staying active",
  },
  {
    value: "STRENGTH",
    title: "Strength",
    description: "Improve strength and performance",
  },
  {
    value: "MAINTENANCE",
    title: "Maintenance",
    description: "Maintain your current fitness level",
  },
  {
    value: "GENERAL_FITNESS",
    title: "General Fitness",
    description: "Improve overall fitness and health",
  },
  {
    value: "ENDURANCE",
    title: "Endurance",
    description: "Improve stamina and endurance",
  },
];

const experiences = [
  {
    value: "BEGINNER",
    title: "Beginner",
    description: "Less than 1 year of consistent training",
  },
  {
    value: "INTERMEDIATE",
    title: "Intermediate",
    description: "Around 1–3 years of consistent training",
  },
  {
    value: "ADVANCED",
    title: "Advanced",
    description: "More than 3 years of consistent training",
  },
];

const locations = [
  {
    value: "GYM",
    title: "Gym",
    description: "I mainly train at a gym",
  },
  {
    value: "HOME",
    title: "Home",
    description: "I mainly train at home",
  },
  {
    value: "BOTH",
    title: "Gym + Home",
    description: "I train in both places",
  },
];

const cardClass =
  "w-full rounded-2xl border border-zinc-200 bg-white p-5 text-left transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600";

const selectedCardClass =
  "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 dark:border-white dark:bg-zinc-800 dark:ring-white";

const inputClass =
  "h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 dark:focus:ring-zinc-800";

export default function OnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(0);

  const [goal, setGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [trainingDays, setTrainingDays] = useState("");
  const [location, setLocation] = useState("");

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [error, setError] = useState("");

  const isLastStep = step === steps.length - 1;

  function nextStep() {
    setError("");

    if (step === 0 && !goal) {
      setError("Please select your goal.");
      return;
    }

    if (step === 1 && !experienceLevel) {
      setError("Please select your experience level.");
      return;
    }

    if (step === 2 && !trainingDays) {
      setError("Please select your training days.");
      return;
    }

    if (step === 3 && !location) {
      setError("Please select your training location.");
      return;
    }

    if (!isLastStep) {
      setStep((current) => current + 1);
    } else {
      saveProfile();
    }
  }

  function previousStep() {
    setError("");

    if (step > 0) {
      setStep((current) => current - 1);
    }
  }

  function saveProfile() {
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age,
            gender,
            height,
            weight,
            goal,
            experienceLevel,
            trainingDays,
            location,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to save your profile.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        console.error(error);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Progress */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Step {step + 1} of {steps.length}
          </span>

          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            {steps[step]}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-950 transition-all duration-300 dark:bg-white"
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {step === 0 && (
          <div>
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight">
                What is your main goal?
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                FitTrack will use this to personalize your experience.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((item) => {
                const selected = goal === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGoal(item.value)}
                    className={`${cardClass} ${
                      selected ? selectedCardClass : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-medium">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </p>
                      </div>

                      {selected && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                          <Check size={15} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight">
                What is your experience level?
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                This helps FitTrack tailor your workout recommendations.
              </p>
            </div>

            <div className="space-y-3">
              {experiences.map((item) => {
                const selected =
                  experienceLevel === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setExperienceLevel(item.value)
                    }
                    className={`${cardClass} ${
                      selected ? selectedCardClass : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-medium">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </p>
                      </div>

                      {selected && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                          <Check size={15} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight">
                How often do you train?
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Choose how many days you usually want to train each week.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const selected = trainingDays === String(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setTrainingDays(String(day))
                    }
                    className={`${cardClass} ${
                      selected ? selectedCardClass : ""
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-semibold">
                        {day}
                      </div>

                      <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {day === 1 ? "day" : "days"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight">
                Where do you train?
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                We will use this when suggesting exercises and workouts.
              </p>
            </div>

            <div className="space-y-3">
              {locations.map((item) => {
                const selected = location === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLocation(item.value)}
                    className={`${cardClass} ${
                      selected ? selectedCardClass : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-medium">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </p>
                      </div>

                      {selected && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                          <Check size={15} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight">
                Tell us about yourself
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                These details help FitTrack personalize your progress tracking.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Age
                </label>

                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={inputClass}
                  placeholder="25"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Height (cm)
                </label>

                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputClass}
                  placeholder="177"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputClass}
                  placeholder="70"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 0 || isPending}
            className="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:invisible dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={isPending}
            className="flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isPending
              ? "Saving..."
              : isLastStep
                ? "Complete Setup"
                : "Continue"}

            {!isPending && !isLastStep && (
              <ArrowRight size={17} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
