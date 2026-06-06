import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getWork,
  getCoverUrl,
  extractDescription,
  getWorkRatings,
  getAuthor,
} from "@/lib/apis/openLibrary";
import { ListButtons } from "@/components/books/ListButtons";
import { RatingWidget } from "@/components/books/RatingWidget";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { getBookActiveLists } from "@/app/actions/lists";

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const work = await getWork(id);
    return {
      title: work.title,
      description:
        extractDescription(work.description)?.slice(0, 160) ?? undefined,
    };
  } catch {
    return { title: "Libro no encontrado" };
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  // Fetch en paralelo: libro + ratings externos + auth
  const [work, olRatings, supabase] = await Promise.all([
    getWork(id).catch(() => null),
    getWorkRatings(id),
    createClient(),
  ]);

  if (!work) notFound();

  // Fetch autores en paralelo (máx 3)
  const authorEntries = work.authors?.slice(0, 3) ?? [];
  const authors = await Promise.all(
    authorEntries.map(({ author }) => {
      const authorId = author.key.replace("/authors/", "");
      return getAuthor(authorId).catch(() => null);
    })
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const coverId = work.covers?.[0];
  const coverUrl = coverId ? getCoverUrl("id", coverId, "L") : null;
  const description = extractDescription(work.description);
  const publishedYear = work.first_publish_date
    ? parseInt(work.first_publish_date)
    : null;

  const bookData = {
    openLibraryId: id,
    title: work.title,
    coverUrl,
    publishedYear: isNaN(publishedYear ?? NaN) ? null : publishedYear,
  };

  // Datos de DB: listas activas + rating del libro + rating del usuario
  const [activeLists, dbBook, dbUser] = await Promise.all([
    user ? getBookActiveLists(id) : Promise.resolve([]),
    db.book.findUnique({ where: { openLibraryId: id } }),
    user
      ? db.user.findUnique({ where: { supabaseId: user.id } })
      : Promise.resolve(null),
  ]);

  // Rating personal del usuario (si existe en nuestra DB)
  let userRating = 0;
  if (dbBook && dbUser) {
    const rating = await db.rating.findUnique({
      where: { userId_bookId: { userId: dbUser.id, bookId: dbBook.id } },
    });
    userRating = rating?.score ?? 0;
  }

  const btAvg = dbBook?.avgRating ?? 0;
  const btCount = dbBook?.ratingsCount ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Portada */}
        <div className="flex-shrink-0">
          <div className="relative mx-auto h-80 w-52 overflow-hidden rounded-lg bg-zinc-100 shadow-lg dark:bg-zinc-800 sm:mx-0">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={work.title}
                fill
                sizes="208px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <span className="text-5xl">📚</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {work.title}
          </h1>

          {/* Autores con link a su perfil */}
          {authors.filter(Boolean).length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-sm text-zinc-500">
              <span>por</span>
              {authors.filter(Boolean).map((author, i) => {
                const authorId = author!.key.replace("/authors/", "");
                return (
                  <span key={author!.key}>
                    <Link
                      href={`/authors/${authorId}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {author!.name}
                    </Link>
                    {i < authors.filter(Boolean).length - 1 && ", "}
                  </span>
                );
              })}
            </div>
          )}

          {work.subjects && work.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.subjects.slice(0, 6).map((subject) => (
                <span
                  key={subject}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                  {subject}
                </span>
              ))}
            </div>
          )}

          {/* Rating (blended bayesiano + rating personal) */}
          <RatingWidget
            bookData={bookData}
            externalAvg={olRatings?.average ?? null}
            externalCount={olRatings?.count ?? 0}
            btAvg={btAvg}
            btCount={btCount}
            initialUserRating={userRating}
            isLoggedIn={!!user}
          />

          {work.first_publish_date && (
            <p className="text-sm text-zinc-500">
              Primera publicación: {work.first_publish_date}
            </p>
          )}

          {/* Botones de lista */}
          <ListButtons
            bookData={bookData}
            initialActiveLists={activeLists}
            isLoggedIn={!!user}
          />

          {/* Enlace Amazon */}
          <Link
            href={`https://www.amazon.com/s?k=${encodeURIComponent(work.title)}&tag=bibliotrack-20`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            🛒 Comprar en Amazon
          </Link>
        </div>
      </div>

      {/* Sinopsis */}
      {description && (
        <div className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Sinopsis</h2>
          <p className="whitespace-pre-line leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
