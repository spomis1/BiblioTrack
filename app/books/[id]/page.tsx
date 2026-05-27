import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getWork,
  getCoverUrl,
  extractDescription,
} from "@/lib/apis/openLibrary";
import { StarRating } from "@/components/books/StarRating";

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
      description: extractDescription(work.description)?.slice(0, 160) ?? undefined,
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

  let work;
  try {
    work = await getWork(id);
  } catch {
    notFound();
  }

  const coverId = work.covers?.[0];
  const coverUrl = coverId ? getCoverUrl("id", coverId, "L") : null;
  const description = extractDescription(work.description);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Cover */}
        <div className="flex-shrink-0">
          <div className="relative h-80 w-52 overflow-hidden rounded-lg shadow-lg bg-zinc-100 dark:bg-zinc-800 mx-auto sm:mx-0">
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

          <div className="flex items-center gap-3">
            <StarRating value={0} size="md" />
            <span className="text-sm text-zinc-500">Sin valoraciones aún — ¡sé el primero!</span>
          </div>

          {work.first_publish_date && (
            <p className="text-sm text-zinc-500">
              Primera publicación: {work.first_publish_date}
            </p>
          )}

          {/* Add to list buttons */}
          <div className="flex flex-wrap gap-3 mt-2">
            <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              + Quiero leer
            </button>
            <button className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
              Leyendo ahora
            </button>
            <button className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
              Ya lo leí
            </button>
          </div>

          {/* Amazon affiliate link placeholder */}
          <Link
            href={`https://www.amazon.com/s?k=${encodeURIComponent(work.title)}&tag=bibliotrack-20`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            🛒 Comprar en Amazon
          </Link>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Sinopsis</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
