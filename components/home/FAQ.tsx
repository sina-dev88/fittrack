
"use client";

import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function FAQ() {
  const { t, isRTL } = useLanguage();

  const questions = [
    {
      question: t("faqWhatIsFitTrackQ"),
      answer: t("faqWhatIsFitTrackA"),
    },
    {
      question: t("faqIsFreeQ"),
      answer: t("faqIsFreeA"),
    },
    {
      question: t("faqCreateOwnPlansQ"),
      answer: t("faqCreateOwnPlansA"),
    },
    {
      question: t("faqGeneratePlanQ"),
      answer: t("faqGeneratePlanA"),
    },
    {
      question: t("faqTrackStrengthQ"),
      answer: t("faqTrackStrengthA"),
    },
    {
      question: t("faqNutritionSleepHabitsQ"),
      answer: t("faqNutritionSleepHabitsA"),
    },
    {
      question: t("faqDataPrivateQ"),
      answer: t("faqDataPrivateA"),
    },
    {
      question: t("faqAICoachQ"),
      answer: t("faqAICoachA"),
    },
    {
      question: t("faqPhoneQ"),
      answer: t("faqPhoneA"),
    },
  ];

  return (
    <section
      id="faq"
      dir={isRTL ? "rtl" : "ltr"}
      className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-24">
        <div className="text-start">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            FAQ
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("faqTitle")}
          </h2>

          <p className="mt-4 max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t("faqDescription")}
          </p>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {questions.map((item, index) => (
            <details
              key={index}
              className="group py-5"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-start font-semibold text-zinc-900 marker:hidden [&::-webkit-details-marker]:hidden dark:text-white">
                <span>{item.question}</span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 transition group-open:rotate-180 group-open:bg-zinc-100 dark:border-zinc-700 dark:group-open:bg-zinc-800">
                  <ChevronDown size={17} />
                </span>
              </summary>

              <p className="mt-4 text-start text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
