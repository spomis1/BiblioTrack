const BASE_URL = "https://www.googleapis.com/books/v1";

export interface GBVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: Array<{ type: string; identifier: string }>;
  pageCount?: number;
  categories?: string[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

export interface GBVolume {
  id: string;
  volumeInfo: GBVolumeInfo;
}

export interface GBSearchResponse {
  totalItems: number;
  items?: GBVolume[];
}

function getApiKey(): string {
  return process.env.GOOGLE_BOOKS_API_KEY ?? "";
}

export async function searchGoogleBooks(
  query: string,
  maxResults = 10
): Promise<GBSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: "books",
  });

  const key = getApiKey();
  if (key) params.set("key", key);

  const res = await fetch(`${BASE_URL}/volumes?${params}`);
  if (!res.ok) throw new Error(`Google Books search failed: ${res.status}`);
  return res.json();
}

export async function getGoogleBook(volumeId: string): Promise<GBVolume> {
  const key = getApiKey();
  const url = `${BASE_URL}/volumes/${volumeId}${key ? `?key=${key}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books volume not found: ${volumeId}`);
  return res.json();
}

export function extractIsbn(volume: GBVolume): string | null {
  const identifiers = volume.volumeInfo.industryIdentifiers ?? [];
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13");
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10");
  return isbn13?.identifier ?? isbn10?.identifier ?? null;
}

export function getHighResCover(volume: GBVolume): string | null {
  const thumb = volume.volumeInfo.imageLinks?.thumbnail;
  if (!thumb) return null;
  // Google Books thumbnails can be upgraded to zoom=1 for higher res
  return thumb.replace("zoom=1", "zoom=2").replace("&edge=curl", "");
}

// ─── Author works (clean, language-filtered) ──────────────────────────────

const JUNK_TITLE =
  /\b(omnibus|collected works|selected works|complete works|anthology|study of|criticism of)\b/i;

function normalizeForDedup(title: string): string {
  return title
    .toLowerCase()
    .replace(/[:\-–—].*/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

async function searchByAuthorAndLang(
  authorName: string,
  lang: "en" | "es",
  maxResults = 40
): Promise<GBVolume[]> {
  const params = new URLSearchParams({
    q: `inauthor:"${authorName}"`,
    printType: "books",
    langRestrict: lang,
    maxResults: String(maxResults),
    orderBy: "relevance",
  });

  const key = getApiKey();
  if (key) params.set("key", key);

  try {
    const res = await fetch(`${BASE_URL}/volumes?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(
        `[GoogleBooks] ${res.status} ${res.statusText} — author="${authorName}" lang=${lang}` +
        (res.status === 403 ? " (falta GOOGLE_BOOKS_API_KEY)" : "")
      );
      return [];
    }
    const data: GBSearchResponse = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error(`[GoogleBooks] fetch error — author="${authorName}" lang=${lang}:`, err);
    return [];
  }
}

/**
 * Devuelve la lista de obras de un autor en inglés y español.
 * Google Books filtra por idioma nativo → no aparecen traducciones a otros idiomas.
 * Se deduplica por título normalizado (inglés primero, luego español).
 * Ordenado: con portada primero.
 */
export async function getAuthorWorksFromGB(
  authorName: string
): Promise<GBVolume[]> {
  const [en, es] = await Promise.all([
    searchByAuthorAndLang(authorName, "en", 40),
    searchByAuthorAndLang(authorName, "es", 20),
  ]);

  const seen = new Map<string, GBVolume>();

  for (const vol of [...en, ...es]) {
    if (JUNK_TITLE.test(vol.volumeInfo.title)) continue;
    const key = normalizeForDedup(vol.volumeInfo.title);
    if (!key) continue;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, vol);
    } else if (!getHighResCover(existing) && getHighResCover(vol)) {
      // Preferir la entrada con portada
      seen.set(key, vol);
    }
  }

  return Array.from(seen.values()).sort((a, b) => {
    const aCover = getHighResCover(a) ? 1 : 0;
    const bCover = getHighResCover(b) ? 1 : 0;
    return bCover - aCover;
  });
}
