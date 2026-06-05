import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user
    ? (user.user_metadata?.full_name ??
       user.user_metadata?.name ??
       user.email?.split("@")[0] ??
       "lector")
    : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-white"
        >
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <span>BiblioTrack</span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link
            href="/books"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Explorar
          </Link>
          <Link
            href="/genres"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Géneros
          </Link>
          <Link
            href="/authors"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Autores
          </Link>
        </div>

        {/* Right side: search + auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/books?q="
            className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar libros...</span>
          </Link>

          {user && displayName ? (
            <UserMenu displayName={displayName} email={user.email ?? ""} />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
