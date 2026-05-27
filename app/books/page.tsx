import { Suspense } from "react";
import { Search } from "lucide-react";
import { searchBooks, getCoverUrl } from "@/lib/apis/openLibrary";
import { BookCard } from "@/components/books/BookCard";

export const metadata = {
  title: "Explorar libros",
  description: "Buscá entre millones de libros en BiblioTrack",
};

interface SearchParams {
  q?: string;
  page?: string;
}

async function BookResults({ query, page }: { query: string; page: number }) {
  if (!query) {
    return (
      <p className="text-center text-zinc-400 py-20">
        Escribí algo para buscar libros...
      </p>
    );
  }

  const results = await searchBooks(query, page, 20);

  if (results.docs.length === 0) {
    return (
      <p className="text-center text-zinc-400 py-20">
        No se encontraron libros para &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-500 mb-6">
        {results.numFound.toLocaleString()} resultados para &ldquo;{query}&rdquo;
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.docs.map((book) => {
          const coverUrl = book.cover_i
            ? getCoverUrl("id", book.cover_i, "M")
            : book.isbn?.[0]
            ? getCoverUrl("isbn", book.isbn[0], "M")
            : null;

          const workId = book.key.replace("/works/", "");

          return (
            <BookCard
              key={book.key}
              id={workId}
              title={book.title}
              author={book.author_name?.[0] ?? "Autor desconocido"}
              coverUrl={coverUrl}
              avgRating={0}
              ratingsCount={0}
              publishedYear={book.first_publish_year}
            />
          );
        })}
      </div>
    </>
  );
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Explorar libros</h1>

      <form className="mb-8" method="GET">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título, autor o ISBN..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-12 pr-6 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </form>

      <Suspense
        key={`${q}-${currentPage}`}
        fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[2/3] w-full rounded-md bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              </div>
            ))}
          </div>
        }
      >
        <BookResults query={q} page={currentPage} />
      </Suspense>
    </div>
  );
}
