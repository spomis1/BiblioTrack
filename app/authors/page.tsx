import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchAuthors, type OLAuthorSearchResult } from "@/lib/apis/openLibrary";
import type { Metadata } from "next";

const NOISE_PATTERNS = /colloque|conférence|conference|symposium|actes|proceedings/i;

/**
 * Filtra y deduplica los resultados de autores de Open Library:
 * 1. Elimina entradas colaborativas (nombre contiene "/")
 * 2. Elimina coloquios y eventos académicos
 * 3. Elimina entradas sin obras cuando ya existe el mismo autor con obras
 * 4. Por nombre duplicado → queda el de mayor work_count
 * 5. Ordena por work_count desc
 */
function cleanAuthorResults(docs: OLAuthorSearchResult[]): OLAuthorSearchResult[] {
  const filtered = docs.filter((a) => {
    if (a.name.includes("/")) return false;       // "auster/furlan"
    if (NOISE_PATTERNS.test(a.name)) return false; // "Colloque Paul Auster"
    return true;
  });

  // Deduplicar por nombre normalizado → quedarse con el de más obras
  const byName = new Map<string, OLAuthorSearchResult>();
  for (const author of filtered) {
    const key = author.name.toLowerCase().trim();
    const existing = byName.get(key);
    if (!existing || (author.work_count ?? 0) > (existing.work_count ?? 0)) {
      byName.set(key, author);
    }
  }

  return Array.from(byName.values()).sort(
    (a, b) => (b.work_count ?? 0) - (a.work_count ?? 0)
  );
}

export const metadata: Metadata = {
  title: "Autores",
  description: "Explorá autores y descubrí sus obras en BiblioTrack",
};

const SUGGESTED = [
  "J.K. Rowling",
  "Stephen King",
  "Gabriel García Márquez",
  "Agatha Christie",
  "George Orwell",
  "Isabel Allende",
  "Jorge Luis Borges",
  "Haruki Murakami",
];

async function AuthorResults({ query }: { query: string }) {
  // Pedimos más resultados de los que vamos a mostrar para tener margen de filtrado
  const results = await searchAuthors(query, 40);
  const authors = cleanAuthorResults(results.docs).slice(0, 12);

  if (authors.length === 0) {
    return (
      <p className="py-20 text-center text-zinc-400">
        No se encontraron autores para &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {authors.map((author) => {
          const authorId = author.key.replace("/authors/", "");
          return (
            <Link
              key={author.key}
              href={`/authors/${authorId}`}
              className="group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {author.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {author.name}
                </p>
                {author.top_work && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                    {author.top_work}
                  </p>
                )}
                {author.work_count != null && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {author.work_count} obra{author.work_count !== 1 ? "s" : ""}
                  </p>
                )}
                {author.birth_date && (
                  <p className="text-xs text-zinc-400">{author.birth_date}</p>
                )}
              </div>
            </Link>
          );
        })}
    </div>
  );
}

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Autores
      </h1>

      <form className="mb-8" method="GET">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar autores..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-12 pr-6 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </form>

      {q ? (
        <Suspense
          key={q}
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-zinc-200 animate-pulse dark:bg-zinc-800"
                />
              ))}
            </div>
          }
        >
          <AuthorResults query={q} />
        </Suspense>
      ) : (
        <div className="text-center py-12">
          <p className="mb-6 text-zinc-500">Buscá tu autor favorito o probá con alguno de estos:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTED.map((name) => (
              <Link
                key={name}
                href={`/authors?q=${encodeURIComponent(name)}`}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
