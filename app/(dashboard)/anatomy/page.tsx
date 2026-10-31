"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  ArrowUpRight,
  Dumbbell,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";

import AnatomyViewer from "@/components/anatomy/AnatomyViewer";
import {
  MUSCLE_REGION_MAP,
  getLocalizedMuscleRegionInfo,
  type MuscleRegionInfo,
} from "@/lib/anatomy/muscle-region-map";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function AnatomyPage() {
  const { t, isRTL, language } = useLanguage();

  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [selectedRegion, setSelectedRegion] = useState("chest-mid");
  const [view, setView] = useState<"front" | "back">("front");
  const [search, setSearch] = useState("");

  const regions = useMemo(() => Object.values(MUSCLE_REGION_MAP), []);

  const selected: MuscleRegionInfo =
    getLocalizedMuscleRegionInfo(selectedRegion, language) ??
    MUSCLE_REGION_MAP[selectedRegion] ??
    MUSCLE_REGION_MAP["chest-mid"];

  const visibleRegions = useMemo(
    () => regions.filter((region) => region.view === view),
    [regions, view],
  );

  const filteredExercises = useMemo(
    () =>
      selected.exercises.filter((exercise) =>
        exercise.toLowerCase().includes(search.toLowerCase()),
      ),
    [selected, search],
  );

  const groupNames: Record<string, string> = {
    chest: t("anatomyGroupChest"),
    shoulders: t("anatomyGroupShoulders"),
    biceps: t("anatomyGroupBiceps"),
    triceps: t("anatomyGroupTriceps"),
    abs: t("anatomyGroupAbs"),
    back: t("anatomyGroupBack"),
    quadriceps: t("anatomyGroupQuadriceps"),
    glutes: t("anatomyGroupGlutes"),
    hamstrings: t("anatomyGroupHamstrings"),
    calves: t("anatomyGroupCalves"),
  };

  const panel = "rounded-2xl border border-[var(--border)] bg-[var(--card)]";

  const muted = "text-[var(--muted)]";

  const subtle = "border border-[var(--border)] bg-[var(--background)]";

  function selectRegion(region: MuscleRegionInfo) {
    setSelectedRegion(region.id);
    setSelectedMuscle(region.parentMuscle);
  }

  function resetView() {
    setSelectedMuscle("chest");
    setSelectedRegion("chest-mid");
    setView("front");
    setSearch("");
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400">
              <Activity size={15} />
              FitTrack / {t("anatomyBreadcrumb")}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("anatomyTitle")}
            </h1>

            <p className={`mt-2 text-sm ${muted}`}>{t("anatomyDescription")}</p>
          </div>

          <div
            className={`flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm sm:self-auto ${subtle}`}
          >
            <span className="h-2 w-2 rounded-full bg-lime-500" />
            {t("anatomyInteractive")}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,0.8fr)]">
          <section className={`${panel} min-w-0 overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <div>
                <p className="text-sm font-semibold">
                  {t("anatomyBodyExplorer")}
                </p>

                <p className={`mt-1 text-xs ${muted}`}>
                  {t("anatomyViewerInstructions")}
                </p>
              </div>

              <div
                className={`flex items-center gap-1 rounded-xl p-1 ${subtle}`}
              >
                {(["front", "back"] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setView(side)}
                    aria-pressed={view === side}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      view === side
                        ? "bg-lime-500 text-black"
                        : `${muted} hover:text-[var(--foreground)]`
                    }`}
                  >
                    {side === "front" ? t("anatomyFront") : t("anatomyBack")}
                  </button>
                ))}
              </div>
            </div>

            <AnatomyViewer
              selectedMuscle={selectedMuscle}
              onSelectMuscle={setSelectedMuscle}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              view={view}
              showViewControls={false}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
              <div className={`flex items-center gap-2 text-xs ${muted}`}>
                <span className="h-2.5 w-2.5 rounded-full bg-lime-500" />

                {t("anatomySelectedRegion")}

                <span className="font-semibold text-[var(--foreground)]">
                  {selected.name}
                </span>
              </div>

              <button
                onClick={resetView}
                className={`inline-flex items-center gap-2 text-xs transition hover:text-lime-600 dark:hover:text-lime-400 ${muted}`}
              >
                <RotateCcw size={13} />
                {t("anatomyResetView")}
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <section className={`${panel} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-600 dark:text-lime-400">
                    {t("anatomyMuscleRegion")}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">{selected.name}</h2>

                  <p className={`mt-2 text-sm ${muted}`}>{selected.area}</p>
                </div>

                <div className="rounded-xl border border-lime-500/25 bg-lime-500/10 p-3 text-lime-600 dark:text-lime-400">
                  <Dumbbell size={22} />
                </div>
              </div>

              <div
                className={`mt-5 grid grid-cols-2 gap-3 rounded-xl p-4 ${subtle}`}
              >
                <div>
                  <p className={`text-xs ${muted}`}>
                    {t("anatomyRelatedExercises")}
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {selected.exercises.length}
                  </p>
                </div>

                <div>
                  <p className={`text-xs ${muted}`}>
                    {t("anatomyMuscleGroup")}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {groupNames[selected.parentMuscle] ?? selected.parentMuscle}
                  </p>
                </div>
              </div>
            </section>

            <section className={`${panel} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">
                    {t("anatomyExerciseLibrary")}
                  </h2>

                  <p className={`mt-1 text-xs ${muted}`}>
                    {t("anatomyExercisesFor")} {selected.name}
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-lime-500/10 px-2.5 py-1 text-xs font-semibold text-lime-700 dark:text-lime-300">
                  {filteredExercises.length} {t("anatomyExercisesCount")}
                </span>
              </div>

              <label
                className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-3 ${subtle}`}
              >
                <Search size={16} className={`shrink-0 ${muted}`} />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("anatomySearchPlaceholder")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                />
              </label>

              <div className="mt-4 space-y-3">
                {filteredExercises.map((exercise, index) => (
                  <article
                    key={`${selected.id}-${exercise}`}
                    className="group rounded-xl border border-[var(--border)] p-4 transition hover:border-lime-500/40"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${subtle} group-hover:text-lime-600 dark:group-hover:text-lime-400`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold">{exercise}</h3>

                        <p className={`mt-1 text-xs ${muted}`}>
                          {t("anatomyRecommendedExercise")}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={17}
                        className={`shrink-0 ${muted} group-hover:text-lime-600 dark:group-hover:text-lime-400`}
                      />
                    </div>
                  </article>
                ))}

                {filteredExercises.length === 0 && (
                  <p className={`py-8 text-center text-sm ${muted}`}>
                    {t("anatomyNoExercises")}
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className={`${panel} p-5 sm:p-6`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400">
                <Sparkles size={17} />

                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  {t("anatomyExploreMuscles")}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold">
                {t("anatomyChooseRegion")}
              </h2>

              <p className={`mt-1 text-sm ${muted}`}>
                {t("anatomyChooseRegionDescription")}
              </p>
            </div>

            <div className={`flex items-center gap-2 text-xs ${muted}`}>
              <ArrowLeftRight size={15} />

              {view === "front" ? t("anatomyFrontView") : t("anatomyBackView")}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleRegions.map((region) => {
              const active = region.id === selectedRegion;
              const localizedRegion =
                getLocalizedMuscleRegionInfo(region.id, language) ?? region;

              return (
                <button
                  key={region.id}
                  onClick={() => selectRegion(region)}
                  aria-pressed={active}
                  className={`rounded-xl border p-4 text-start transition ${
                    active
                      ? "border-lime-500/50 bg-lime-500/10"
                      : "border-[var(--border)] hover:border-lime-500/30"
                  }`}
                >
                  <div
                    className={`mb-3 h-1.5 w-8 rounded-full ${
                      active ? "bg-lime-500" : "bg-[var(--border)]"
                    }`}
                  />

                  <p
                    className={`text-sm font-semibold ${
                      active ? "text-lime-700 dark:text-lime-300" : ""
                    }`}
                  >
                    {localizedRegion.name}
                  </p>

                  <p className={`mt-2 text-xs ${muted}`}>{localizedRegion.area}</p>
                </button>
              );
            })}
          </div>
        </section>

        <footer className={`pb-4 text-center text-xs ${muted}`}>
          FitTrack Anatomy
        </footer>
      </div>
    </main>
  );
}
