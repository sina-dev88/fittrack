export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-56 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-96 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}