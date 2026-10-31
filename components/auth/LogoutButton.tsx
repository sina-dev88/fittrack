"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
      className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
    >
      <LogOut size={17} />

      <span className="hidden md:inline">
        Logout
      </span>
    </button>
  );
}
