import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { BookOpen, Search, Plus } from "lucide-react";

export const metadata = {
  title: "Mi biblioteca",
};

interface BookItem {
  id: string;
  addedAt: Date;
  book: {
    id: string;
    title: string;
    coverUrl: string | null;
    openLibraryId: string | null;
  };
}

function BookShelf({
  title,
  emoji,
  items,
  emptyText,
}: {
  title: string;
  emoji: string;
  items: BookItem[];
  emptyText: string;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {emoji} {title}{" "}
        <span className="ml-1 text-sm font-normal text-zinc-400">
          ({items.length})
        </span>
      </h2>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-400 dark:border-zinc-800">
          {emptyText}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {items.map(({ id, book }) => (
            <Link
              key={id}
              href={`/books/${book.openLibraryId ?? book.id}`}
              className="group flex-shrink-0"
            >
              <div className="relative h-36 w-24 overflow-hidden rounded-md bg-zinc-100 shadow-sm transition-shadow group-hover:shadow-md dark:bg-zinc-800">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  </div>
                )}
              </div>
              <p className="mt-1 w-24 truncate text-xs text-zinc-600 dark:text-zinc-400">
                {book.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "lector";

  // Leer listas del usuario desde nuestra DB
  const dbUser = await db.user.findUnique({
    where: { supabaseId: user.id },
  });

  let wantToRead: BookItem[] = [];
  let reading: BookItem[] = [];
  let read: BookItem[] = [];

  if (dbUser) {
    const lists = await db.readingList.findMany({
      where: {
        userId: dbUser.id,
        type: { in: ["WANT_TO_READ", "READING", "READ"] },
      },
      include: {
        items: {
          include: { book: true },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    for (const list of lists) {
      if (list.type === "WANT_TO_READ") wantToRead = list.items;
      if (list.type === "READING") reading = list.items;
      if (list.type === "READ") read = list.items;
    }
  }

  const totalBooks = wantToRead.length + reading.length + read.length;
  const hasBooks = totalBooks > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Bienvenida */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Hola, {displayName} 👋
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Tu biblioteca personal
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-indigo-600">
            {wantToRead.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Quiero leer</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-emerald-600">
            {reading.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Leyendo</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {read.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Leídos</p>
        </div>
      </div>

      {hasBooks ? (
        /* Estantes por categoría */
        <div className="flex flex-col gap-10">
          <BookShelf
            title="Quiero leer"
            emoji="📚"
            items={wantToRead}
            emptyText="Todavía no agregaste libros aquí"
          />
          <BookShelf
            title="Leyendo ahora"
            emoji="📖"
            items={reading}
            emptyText="No tenés libros en progreso"
          />
          <BookShelf
            title="Ya leídos"
            emoji="✅"
            items={read}
            emptyText='Marcá libros como "Ya lo leí" para verlos acá'
          />

          <div className="flex justify-center">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-all hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Plus className="h-4 w-4" />
              Agregar más libros
            </Link>
          </div>
        </div>
      ) : (
        /* Estado vacío */
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h2 className="mb-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            Tu biblioteca está vacía
          </h2>
          <p className="mx-auto mb-6 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Buscá un libro y tocá &ldquo;Quiero leer&rdquo; para empezar tu
            biblioteca.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Search className="h-4 w-4" />
            Explorar libros
          </Link>
        </div>
      )}
    </div>
  );
}
