import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAuthor,
  getAuthorWorks,
  getCoverUrl,
  type OLWork,
} from "@/lib/apis/openLibrary";
import { getAuthorWikiSummary } from "@/lib/apis/wikipedia";
import {
  getAuthorWorksFromGB,
  getHighResCover,
  extractIsbn,
  type GBVolume,
} from "@/lib/apis/googleBooks";
import { AuthorAvatar } from "@/components/authors/AuthorAvatar";
import { BookOpen, ExternalLink, Calendar } from "lucide-react";

interface Params {
  id: string;
}

/** Traduce nombres de meses en inglés al español */
function toSpanishDate(dateStr: string): string {
  const meses: Record<string, string> = {
    january: "enero", february: "febrero", march: "marzo",
    april: "abril", may: "mayo", june: "junio",
    july: "julio", august: "agosto", september: "septiembre",
    october: "octubre", november: "noviembre", december: "diciembre",
  };
  return dateStr.replace(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
    (m) => meses[m.toLowerCase()] ?? m
  );
}

// ── Tipo unificado para renderizar sin importar la fuente ──────────────────
interface BookCard {
  id: string;
  title: string;
  coverUrl: string | null;
  href: string | null;
}

// ── Conversores ────────────────────────────────────────────────────────────
function fromGB(volumes: GBVolume[]): BookCard[] {
  return volumes.map((vol) => {
    const isbn = extractIsbn(vol);
    return {
      id: vol.id,
      title: vol.volumeInfo.title,
      coverUrl: getHighResCover(vol),
      href: isbn ? `/books/isbn/${isbn}` : null,
    };
  });
}

// Filtro mínimo de OL: solo no-latinos, dedup por título, portadas primero
const NON_LATIN_OL = /[Ѐ-ӿ؀-ۿ֐-׿一-鿿぀-ヿ가-힯ऀ-ॿ฀-๿]/;

function fromOL(entries: OLWork[]): BookCard[] {
  const seen = new Map<string, OLWork>();
  for (const work of entries) {
    if (NON_LATIN_OL.test(work.title)) continue;
    const key = work.title
      .toLowerCase()
      .replace(/[:\-–—].*/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 40);
    if (!key) continue;
    const existing = seen.get(key);
    if (!existing || (!existing.covers?.length && work.covers?.length)) {
      seen.set(key, work);
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => ((b.covers?.length ?? 0) > 0 ? 1 : 0) - ((a.covers?.length ?? 0) > 0 ? 1 : 0))
    .map((w) => ({
      id: w.key,
      title: w.title,
      coverUrl: w.covers?.[0] ? getCoverUrl("id", w.covers[0], "M") : null,
      href: `/books/${w.key.replace("/works/", "")}`,
    }));
}

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const author = await getAuthor(id);
    return {
      title: author.name,
      description: `Obras y biografía de ${author.name} en BiblioTrack`,
    };
  } catch {
    return { title: "Autor no encontrado" };
  }
}

// ── Página ─────────────────────────────────────────────────────────────────
export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const author = await getAuthor(id).catch(() => null);
  if (!author) notFound();

  // Info del autor + Google Books en paralelo
  const [wiki, gbVolumes] = await Promise.all([
    getAuthorWikiSummary(author.name, author.wikipedia ?? undefined),
    getAuthorWorksFromGB(author.name),
  ]);

  // Si Google Books falló (sin API key), caemos a Open Library
  let books: BookCard[];
  if (gbVolumes.length > 0) {
    books = fromGB(gbVolumes);
  } else {
    const worksData = await getAuthorWorks(id, 200).catch(() => ({ entries: [] as OLWork[] }));
    books = fromOL(worksData.entries);
  }

  const bio = wiki?.extract ?? null;
  const wikiUrl = wiki?.content_urls?.desktop?.page ?? author.wikipedia ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-12 flex flex-col gap-8 sm:flex-row">
        <AuthorAvatar olid={id} name={author.name} size="lg" />

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {author.name}
          </h1>

          {(author.birth_date || author.death_date) && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {author.birth_date ? toSpanishDate(author.birth_date) : "?"}
                {author.death_date ? ` – ${toSpanishDate(author.death_date)}` : ""}
              </span>
            </div>
          )}

          {bio ? (
            <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
              {bio}
            </p>
          ) : (
            <p className="text-sm text-zinc-400">Biografía no disponible.</p>
          )}

          {wikiUrl && (
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en Wikipedia
            </a>
          )}
        </div>
      </div>

      {/* Obras */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Obras
        </h2>

        {books.length === 0 ? (
          <p className="text-zinc-400">No se encontraron obras para este autor.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book) => {
              const inner = (
                <div className="group flex flex-col gap-2 rounded-lg p-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-100 shadow-sm transition-shadow group-hover:shadow-md dark:bg-zinc-800">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
                        <BookOpen className="h-6 w-6 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
                        <p className="line-clamp-4 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">
                          {book.title}
                        </p>
                      </div>
                    )}
                  </div>
                  {book.coverUrl && (
                    <p className="line-clamp-2 px-1 text-xs font-medium leading-snug text-zinc-700 dark:text-zinc-300">
                      {book.title}
                    </p>
                  )}
                </div>
              );

              return book.href ? (
                <Link key={book.id} href={book.href}>
                  {inner}
                </Link>
              ) : (
                <div key={book.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
