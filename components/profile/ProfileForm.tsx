
"use client";

import { useState, useTransition } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";

type Profile = {
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  experienceLevel: string | null;
  trainingDays: number | null;
  location: string | null;
};

type Props = {
  user: {
    name: string | null;
    email: string;
  };
  profile: Profile | null;
};

const inputClass =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 dark:focus:ring-zinc-800";

const labelClass =
  "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function ProfileForm({ user, profile }: Props) {
  const { t, isRTL } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user.name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [height, setHeight] = useState(profile?.height?.toString() ?? "");
  const [weight, setWeight] = useState(profile?.weight?.toString() ?? "");
  const [goal, setGoal] = useState(profile?.goal ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    profile?.experienceLevel ?? ""
  );
  const [trainingDays, setTrainingDays] = useState(
    profile?.trainingDays?.toString() ?? ""
  );
  const [location, setLocation] = useState(profile?.location ?? "");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function saveProfile() {
    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
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
          setError(data.error || t("profileSaveError"));
          return;
        }

        setMessage(t("profileSaveSuccess"));
      } catch {
        setError(t("somethingWentWrong"));
      }
    });
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-base font-semibold">
            {t("profilePersonalInfo")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("profileBasicInfoDescription")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>{t("profileFullName")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder={t("profileNamePlaceholder")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("profileEmail")}</label>
            <input
              value={user.email}
              disabled
              dir="ltr"
              className={`${inputClass} cursor-not-allowed opacity-60`}
            />
          </div>

          <div>
            <label className={labelClass}>{t("profileAge")}</label>
            <input
              type="number"
              min="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputClass}
              placeholder="25"
            />
          </div>

          <div>
            <label className={labelClass}>{t("profileGender")}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("profileSelect")}</option>
              <option value="MALE">{t("profileMale")}</option>
              <option value="FEMALE">{t("profileFemale")}</option>
              <option value="OTHER">{t("profileOther")}</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-base font-semibold">
            {t("profileFitnessInfo")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("profileFitnessInfoDescription")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>{t("profileHeight")}</label>
            <input
              type="number"
              min="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className={inputClass}
              placeholder="177"
            />
          </div>

          <div>
            <label className={labelClass}>{t("profileWeight")}</label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={inputClass}
              placeholder="70"
            />
          </div>

          <div>
            <label className={labelClass}>{t("profileGoal")}</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("profileSelectGoal")}</option>
              <option value="MUSCLE_GAIN">{t("profileMuscleGain")}</option>
              <option value="FAT_LOSS">{t("profileFatLoss")}</option>
              <option value="STRENGTH">{t("profileStrength")}</option>
              <option value="MAINTENANCE">{t("profileMaintenance")}</option>
              <option value="GENERAL_FITNESS">
                {t("profileGeneralFitness")}
              </option>
              <option value="ENDURANCE">{t("profileEndurance")}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("profileExperienceLevel")}
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("profileSelectLevel")}</option>
              <option value="BEGINNER">{t("profileBeginner")}</option>
              <option value="INTERMEDIATE">{t("profileIntermediate")}</option>
              <option value="ADVANCED">{t("profileAdvanced")}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("profileTrainingDays")}
            </label>
            <select
              value={trainingDays}
              onChange={(e) => setTrainingDays(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("profileSelect")}</option>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <option key={day} value={day}>
                  {day} {day === 1 ? t("profileDay") : t("profileDays")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("profileTrainingLocation")}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("profileSelect")}</option>
              <option value="GYM">{t("profileGym")}</option>
              <option value="HOME">{t("profileHome")}</option>
              <option value="BOTH">{t("profileGymHome")}</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm" aria-live="polite">
          {message && (
            <span className="text-emerald-600">{message}</span>
          )}
          {error && <span className="text-red-500">{error}</span>}
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={isPending}
          className="h-11 shrink-0 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isPending ? t("profileSaving") : t("profileSaveChanges")}
        </button>
      </div>
    </div>
  );
}
