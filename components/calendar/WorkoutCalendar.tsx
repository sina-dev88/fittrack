"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
} from "lucide-react";

import {
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";

import { useLanguage } from "@/components/language/LanguageProvider";

type Workout = {
  id: string;
  name: string;
  completedAt: string;
};

type Props = {
  workouts: Workout[];
};

type WeekdayKey =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

const weekdayTranslationKeys = {
  sun: "calendarSunday",
  mon: "calendarMonday",
  tue: "calendarTuesday",
  wed: "calendarWednesday",
  thu: "calendarThursday",
  fri: "calendarFriday",
  sat: "calendarSaturday",
} as const;

const englishWeekdays = [
  { key: "sun", short: "Sun" },
  { key: "mon", short: "Mon" },
  { key: "tue", short: "Tue" },
  { key: "wed", short: "Wed" },
  { key: "thu", short: "Thu" },
  { key: "fri", short: "Fri" },
  { key: "sat", short: "Sat" },
] as const;

const persianWeekdays = [
  { key: "sat", short: "ش" },
  { key: "sun", short: "ی" },
  { key: "mon", short: "د" },
  { key: "tue", short: "س" },
  { key: "wed", short: "چ" },
  { key: "thu", short: "پ" },
  { key: "fri", short: "ج" },
] as const;

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(date1: Date, date2: Date) {
  return getDateKey(date1) === getDateKey(date2);
}

/**
 * Convert a Jalali date into a local Gregorian Date.
 * Calendar dates remain Gregorian internally, matching workout records.
 */
function getGregorianDate(
  jalaliYear: number,
  jalaliMonth: number,
  jalaliDay: number,
) {
  const { gy, gm, gd } = toGregorian(
    jalaliYear,
    jalaliMonth,
    jalaliDay,
  );

  return new Date(gy, gm - 1, gd);
}

function shiftJalaaliMonth(
  year: number,
  month: number,
  offset: number,
) {
  const totalMonths = year * 12 + month - 1 + offset;

  return {
    jy: Math.floor(totalMonths / 12),
    jm: ((totalMonths % 12) + 12) % 12 + 1,
  };
}

export default function WorkoutCalendar({ workouts }: Props) {
  const { language, isRTL, t } = useLanguage();

  const isPersian = language === "fa";

  const locale = isPersian
    ? "fa-IR-u-ca-persian"
    : "en-US";

  const numberFormat = new Intl.NumberFormat(
    isPersian ? "fa-IR" : "en-US",
  );

  const [currentDate, setCurrentDate] = useState(
    () => new Date(),
  );

  const today = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const weekdays = isPersian
    ? persianWeekdays
    : englishWeekdays;

  const days = useMemo(() => {
    // Actual Jalali calendar grid.
    if (isPersian) {
      const { jy, jm } = toJalaali(currentDate);

      const firstDate = getGregorianDate(jy, jm, 1);

      // Saturday is index 0 in the Persian calendar.
      const firstDay = (firstDate.getDay() + 1) % 7;

      const daysInMonth = jalaaliMonthLength(jy, jm);

      const totalCells =
        Math.ceil((firstDay + daysInMonth) / 7) * 7;

      return Array.from({ length: totalCells }, (_, index) => {
        const dayOffset = index - firstDay + 1;

        // Previous Jalali month.
        if (dayOffset <= 0) {
          const previous = shiftJalaaliMonth(jy, jm, -1);

          const previousMonthDays = jalaaliMonthLength(
            previous.jy,
            previous.jm,
          );

          return {
            date: getGregorianDate(
              previous.jy,
              previous.jm,
              previousMonthDays + dayOffset,
            ),
            isCurrentMonth: false,
          };
        }

        // Next Jalali month.
        if (dayOffset > daysInMonth) {
          const next = shiftJalaaliMonth(jy, jm, 1);

          return {
            date: getGregorianDate(
              next.jy,
              next.jm,
              dayOffset - daysInMonth,
            ),
            isCurrentMonth: false,
          };
        }

        // Current Jalali month.
        return {
          date: getGregorianDate(jy, jm, dayOffset),
          isCurrentMonth: true,
        };
      });
    }

    // Gregorian calendar grid for English.
    const firstDay = new Date(
      currentYear,
      currentMonth,
      1,
    ).getDay();

    const daysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate();

    const previousMonthDays = new Date(
      currentYear,
      currentMonth,
      0,
    ).getDate();

    const totalCells =
      Math.ceil((firstDay + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayOffset = index - firstDay + 1;

      if (dayOffset <= 0) {
        return {
          date: new Date(
            currentYear,
            currentMonth - 1,
            previousMonthDays + dayOffset,
          ),
          isCurrentMonth: false,
        };
      }

      if (dayOffset > daysInMonth) {
        return {
          date: new Date(
            currentYear,
            currentMonth + 1,
            dayOffset - daysInMonth,
          ),
          isCurrentMonth: false,
        };
      }

      return {
        date: new Date(
          currentYear,
          currentMonth,
          dayOffset,
        ),
        isCurrentMonth: true,
      };
    });
  }, [currentDate, currentYear, currentMonth, isPersian]);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout[]>();

    for (const workout of workouts) {
      const date = new Date(workout.completedAt);
      const key = getDateKey(date);

      const existing = map.get(key) ?? [];

      existing.push(workout);
      map.set(key, existing);
    }

    return map;
  }, [workouts]);

  function previousMonth() {
    if (isPersian) {
      const { jy, jm } = toJalaali(currentDate);
      const previous = shiftJalaaliMonth(jy, jm, -1);

      setCurrentDate(
        getGregorianDate(previous.jy, previous.jm, 1),
      );

      return;
    }

    setCurrentDate(
      new Date(currentYear, currentMonth - 1, 1),
    );
  }

  function nextMonth() {
    if (isPersian) {
      const { jy, jm } = toJalaali(currentDate);
      const next = shiftJalaaliMonth(jy, jm, 1);

      setCurrentDate(
        getGregorianDate(next.jy, next.jm, 1),
      );

      return;
    }

    setCurrentDate(
      new Date(currentYear, currentMonth + 1, 1),
    );
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  return (
    <div
      className="space-y-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays
              size={20}
              className="text-zinc-500"
            />

            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
              {monthName}
            </h2>
          </div>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("calendarCompletedDescription")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="h-9 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t("calendarToday")}
          </button>

          <button
            type="button"
            onClick={previousMonth}
            aria-label={t("calendarPreviousMonth")}
            title={t("calendarPreviousMonth")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ChevronLeft
              size={18}
              className={isRTL ? "rotate-180" : ""}
            />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            aria-label={t("calendarNextMonth")}
            title={t("calendarNextMonth")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ChevronRight
              size={18}
              className={isRTL ? "rotate-180" : ""}
            />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Week Days */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
          {weekdays.map((day) => (
            <div
              key={day.key}
              title={t(weekdayTranslationKeys[day.key as WeekdayKey])}
              aria-label={t(
                weekdayTranslationKeys[day.key as WeekdayKey],
              )}
              className="px-1 py-3 text-center text-xs font-semibold text-zinc-500 sm:px-2"
            >
              {day.short}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map(({ date, isCurrentMonth }, index) => {
            const dateKey = getDateKey(date);

            const dayWorkouts =
              workoutsByDate.get(dateKey) ?? [];

            const isToday = isSameDay(date, today);

            const dayNumber = isPersian
              ? numberFormat.format(toJalaali(date).jd)
              : numberFormat.format(date.getDate());

            const fullDate = new Intl.DateTimeFormat(locale, {
              dateStyle: "full",
            }).format(date);

            return (
              <div
                key={`${dateKey}-${index}`}
                className={`min-h-[100px] border-b border-e border-zinc-100 p-1.5 dark:border-zinc-800/70 sm:min-h-[120px] sm:p-2 ${
                  !isCurrentMonth
                    ? "bg-zinc-50/70 dark:bg-zinc-950/40"
                    : ""
                }`}
              >
                {/* Day Number */}
                <div
                  className={`flex ${
                    isRTL ? "justify-start" : "justify-end"
                  }`}
                >
                  <span
                    title={fullDate}
                    aria-label={fullDate}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                        : isCurrentMonth
                          ? "text-zinc-700 dark:text-zinc-300"
                          : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  >
                    {dayNumber}
                  </span>
                </div>

                {/* Completed Workouts */}
                <div className="mt-2 space-y-1.5">
                  {dayWorkouts.map((workout) => (
                    <Link
                      key={workout.id}
                      href={`/workouts/${workout.id}`}
                      title={workout.name}
                      className="block rounded-lg bg-zinc-100 px-1.5 py-1.5 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 sm:px-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <Dumbbell
                          size={11}
                          className="shrink-0 text-zinc-500"
                        />

                        <span className="truncate text-[11px] font-medium text-zinc-700 dark:text-zinc-200">
                          {workout.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-950 dark:bg-white" />
          {t("calendarToday")}
        </div>

        <div>
          {numberFormat.format(workouts.length)}{" "}
          {workouts.length === 1
            ? t("calendarCompletedWorkoutSingular")
            : t("calendarCompletedWorkoutPlural")}
        </div>
      </div>
    </div>
  );
}