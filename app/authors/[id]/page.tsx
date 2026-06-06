import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAuthor,
  getAuthorWorks,
  getAuthorPhotoUrl,
  getCoverUrl,
  extractDescription,
} from "@/lib/apis/openLibrary";
import { BookOpen, ExternalLink, Calendar } from "lucide-react";

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
    const author = await getAuthor(id);
    const bio = extractDescription(author.bio);
    return {
      title: author.name,
      description: bio?.slice(0, 160) ?? `Obras y biografía de ${author.name}`,
    };
  } catch {
    return { title: "Autor no encontrado" };
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const [author, worksData] = await Promise.all([
    getAuthor(id).catch(() => null),
    getAuthorWorks(id, 18).catch(() => ({ entries: [] })),
  ]);

  if (!author) notFound();

  const photoUrl = author.photos?.[0]
    ? getAuthorPhotoUrl(author.photos[0], "L")
    : null;

  const bio = extractDescription(author.bio);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header del autor */}
      <div className="mb-12 flex flex-col gap-8 sm:flex-row">
        {/* Foto */}
        <div className="flex-shrink-0">
          <div className="relative mx-auto h-48 w-36 overflow-hidden rounded-xl bg-zinc-100 shadow-md dark:bg-zinc-800 sm:mx-0">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={author.name}
                fill
                sizes="144px"
                className="object-cover object-top"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl font-bold text-zinc-300 dark:text-zinc-600">
                {author.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {author.name}
          </h1>

          {/* Fechas */}
          {(author.birth_date || author.death_date) && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Calendar className="h-4 w-4" />
              <span>
                {author.birth_date ?? "?"}
                {author.death_date ? ` – ${author.death_date}` : ""}
              </span>
            </div>
          )}

          {/* Wikipedia */}
          {author.wikipedia && (
            <a
              href={author.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en Wikipedia
            </a>
          )}

          {/* Bio */}
          {bio && (
            <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-6">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* Obras */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Obras
        </h2>

        {worksData.entries.length === 0 ? (
          <p className="text-zinc-400">No se encontraron obras para este autor.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {worksData.entries.map((work) => {
              const workId = work.key.replace("/works/", "");
              const coverId = work.covers?.[0];
              const coverUrl = coverId ? getCoverUrl("id", coverId, "M") : null;

              return (
                <Link
                  key={work.key}
                  href={`/books/${workId}`}
                  className="group flex flex-col gap-2 rounded-lg p-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-100 shadow-sm transition-shadow group-hover:shadow-md dark:bg-zinc-800">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={work.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <p className="line-clamp-2 px-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
                    {work.title}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
