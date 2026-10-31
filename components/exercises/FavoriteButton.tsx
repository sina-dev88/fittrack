"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";

type Props = {
  exerciseId: string;
  initialFavorited: boolean;
};

export default function FavoriteButton({
  exerciseId,
  initialFavorited,
}: Props) {
  const { t } = useLanguage();

  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/exercises/${exerciseId}/favorite`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update favorite.");
      }

      const data = await response.json();
      setFavorited(data.favorited);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={
        favorited
          ? t("exerciseRemoveFavorite")
          : t("exerciseAddFavorite")
      }
      aria-pressed={favorited}
      title={
        favorited
          ? t("exerciseRemoveFavorite")
          : t("exerciseAddFavorite")
      }
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-60 ${
        favorited
          ? "border-zinc-300 bg-zinc-100 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          : "border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      <Heart
        size={18}
        fill={favorited ? "currentColor" : "none"}
      />
    </button>
  );
}
