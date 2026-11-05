"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, LoaderCircle } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  planId: string;
  planName: string;
  createdAt: string;
  completedWorkouts: number;
  href: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load notifications.");
        }

        const data = await response.json();

        if (active) {
          setNotifications(data.notifications ?? []);
          setError("");
        }
      } catch {
        if (active) setError("Notifications couldn't be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  async function markAsReviewed(planId: string) {
    try {
      const response = await fetch(`/api/workout-plans/${planId}/review`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to review workout plan.");
      }

      setNotifications((current) =>
        current.filter((notification) => notification.planId !== planId),
      );
    } catch (error) {
      console.error("Review error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to review workout plan.",
      );
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${notifications.length ? `, ${notifications.length} plan reviews` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <Bell size={19} />

        {notifications.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <section className="fixed inset-x-3 top-[4.5rem] z-50 mx-auto w-auto max-w-[350px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[350px]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-white">
                Notifications
              </h2>
              <span className="text-xs text-zinc-500">
                {notifications.length} reviews
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-sm text-zinc-500">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading...
                </div>
              ) : error ? (
                <p className="p-4 text-sm text-red-500">{error}</p>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                  <p className="font-medium text-zinc-900 dark:text-white">
                    You’re all caught up!
                  </p>
                  <p className="text-sm text-zinc-500">
                    No workout plans need a four-week review yet.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border-b border-zinc-100 p-4 dark:border-zinc-800"
                  >
                    <Link
                      href={notification.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg transition hover:opacity-80"
                    >
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-zinc-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                        {notification.completedWorkouts} completed workouts
                        {" · "}View plan →
                      </p>
                    </Link>

                    <button
                      type="button"
                      onClick={() => markAsReviewed(notification.planId)}
                      className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Mark as reviewed
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
