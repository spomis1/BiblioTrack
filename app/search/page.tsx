import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import {
  searchBooks,
  searchAuthors,
  getCoverUrl,
  type OLAuthorSearchResult,
} from "@/lib/apis/openLibrary";
import { AuthorAvatar } from "@/components/authors/AuthorAvatar";

export const metadata: Metadata = {
  title: "Buscar",
};

const NOISE_PATTERNS = /colloque|conférence|conference|symposium|actes|proceedings/i;

function cleanAuthors(docs: OLAuthorSearchResult[]): OLAuthorSearchResult[] {
  const filtered = docs.filter(
    (a) => !a.name.includes("/") && !NOISE_PATTERNS.test(a.name)
  );
  const byName = new Map<string, OLAuthorSearchResult>();
  for (const a of filtered) {
    const key = a.name.toLowerCase().trim();
    const existing = byName.get(key);
    if (!existing || (a.work_count ?? 0) > (existing.work_count ?? 0)) {
      byName.set(key, a);
    }
  }
  return Array.from(byName.values())
    .sort((a, b) => (b.work_count ?? 0) - (a.work_count ?? 0))
    .slice(0, 4);
}

async function SearchResults({ query }: { query: string }) {
  const [booksRes, authorsRes] = await Promise.all([
    searchBooks(query, 1, 6),
    searchAuthors(query, 20),
  ]);

  const books = booksRes.docs;
  const authors = cleanAuthors(authorsRes.docs);

  if (books.length === 0 && authors.length === 0) {
    return (
      <p className="py-20 text-center text-zinc-400">
        No se encontraron resultados para &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Autores */}
      {authors.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Autores
            </h2>
            <Link
              href={`/authors?q=${encodeURIComponent(query)}`}
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {authors.map((author) => {
              const authorId = author.key.replace("/authors/", "");
              return (
                <Link
                  key={author.key}
                  href={`/authors/${authorId}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <AuthorAvatar olid={authorId} name={author.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {author.name}
                    </p>
                    {author.work_count != null && (
                      <p className="text-xs text-zinc-400">
                        {author.work_count} obras
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Libros */}
      {books.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Libros
            </h2>
            <Link
              href={`/books?q=${encodeURIComponent(query)}`}
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ver todos ({booksRes.numFound.toLocaleString()}) →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {books.map((book) => {
              const coverUrl = book.cover_i
                ? getCoverUrl("id", book.cover_i, "M")
                : book.isbn?.[0]
                ? getCoverUrl("isbn", book.isbn[0], "M")
                : null;
              const workId = book.key.replace("/works/", "");

              return (
                <Link
                  key={book.key}
                  href={`/books/${workId}`}
                  className="group flex flex-col gap-2 rounded-lg p-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-100 shadow-sm transition-shadow group-hover:shadow-md dark:bg-zinc-800">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        📚
                      </div>
                    )}
                  </div>
                  <div className="px-1">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                      {book.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-zinc-500">
                      {book.author_name?.[0] ?? ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <form className="mb-10" method="GET" action="/search">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Buscar libros, autores..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-12 pr-6 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </form>

      {q ? (
        <Suspense
          key={q}
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-20 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          }
        >
          <SearchResults query={q} />
        </Suspense>
      ) : (
        <p className="py-20 text-center text-zinc-400">
          Escribí algo para buscar libros o autores...
        </p>
      )}
    </div>
  );
}
