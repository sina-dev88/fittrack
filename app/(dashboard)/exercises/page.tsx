import ExerciseLibrary from "@/components/exercises/ExerciseLibrary";
import ExercisesHeader from "@/components/exercises/ExercisesHeader";

export default function ExercisesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <ExercisesHeader />

      <ExerciseLibrary />
    </div>
  );
}