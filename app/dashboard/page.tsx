import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Search, Star, List } from "lucide-react";

export const metadata = {
  title: "Mi biblioteca",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split("@")[0]
    || "lector";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Bienvenida */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Hola, {displayName} 👋
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Bienvenido a tu biblioteca personal
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-12">
        <Link
          href="/books"
          className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
            <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Explorar libros</p>
            <p className="text-sm text-zinc-500">Buscá tu próxima lectura</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 opacity-60">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Mis ratings</p>
            <p className="text-sm text-zinc-500">0 libros puntuados</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 opacity-60">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <List className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Mis listas</p>
            <p className="text-sm text-zinc-500">Quiero leer · Leyendo · Leído</p>
          </div>
        </div>
      </div>

      {/* Estado vacío */}
      <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-16 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Tu biblioteca está vacía
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
          Buscá un libro y agregalo a tus listas para empezar a construir tu biblioteca personal.
        </p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Search className="h-4 w-4" />
          Explorar libros
        </Link>
      </div>
    </div>
  );
}
