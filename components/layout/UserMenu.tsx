"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Library } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  displayName: string;
  email: string;
}

export function UserMenu({ displayName, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          {initial}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {displayName}
              </p>
              <p className="truncate text-xs text-zinc-500">{email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Library className="h-4 w-4" />
                Mi biblioteca
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
