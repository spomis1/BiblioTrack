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
