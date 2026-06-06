const BASE_URL = "https://openlibrary.org";
const COVERS_URL = "https://covers.openlibrary.org";
const USER_AGENT = "BiblioTrack/1.0 (sebastianpomi@gmail.com)";

const headers = { "User-Agent": USER_AGENT };

export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
  language?: string[];
  number_of_pages_median?: number;
}

export interface OLSearchResponse {
  numFound: number;
  docs: OLSearchResult[];
}

export interface OLWork {
  key: string;
  title: string;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
  first_publish_date?: string;
  authors?: Array<{ author: { key: string }; type: { key: string } }>;
}

export interface OLAuthorSearchResult {
  key: string; // "/authors/OL23919A"
  name: string;
  top_work?: string;
  work_count?: number;
  birth_date?: string;
  top_subjects?: string[];
}

export interface OLAuthorSearchResponse {
  numFound: number;
  docs: OLAuthorSearchResult[];
}

export interface OLAuthor {
  key: string;
  name: string;
  birth_date?: string;
  death_date?: string;
  bio?: string | { value: string };
  photos?: number[];
  wikipedia?: string;
}

export async function searchBooks(
  query: string,
  page = 1,
  limit = 20
): Promise<OLSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
    fields: "key,title,author_name,author_key,first_publish_year,cover_i,isbn,subject,language,number_of_pages_median",
  });

  const res = await fetch(`${BASE_URL}/search.json?${params}`, { headers });
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);
  return res.json();
}

export async function getWork(workId: string): Promise<OLWork> {
  const id = workId.startsWith("/works/") ? workId : `/works/${workId}`;
  const res = await fetch(`${BASE_URL}${id}.json`, { headers });
  if (!res.ok) throw new Error(`Open Library work not found: ${workId}`);
  return res.json();
}

export async function getAuthor(authorId: string): Promise<OLAuthor> {
  const id = authorId.startsWith("/authors/") ? authorId : `/authors/${authorId}`;
  const res = await fetch(`${BASE_URL}${id}.json`, { headers });
  if (!res.ok) throw new Error(`Open Library author not found: ${authorId}`);
  return res.json();
}

export async function getAuthorWorks(
  authorId: string,
  limit = 20
): Promise<{ entries: OLWork[] }> {
  const id = authorId.startsWith("/authors/") ? authorId : `/authors/${authorId}`;
  const res = await fetch(`${BASE_URL}${id}/works.json?limit=${limit}`, { headers });
  if (!res.ok) throw new Error(`Author works not found: ${authorId}`);
  return res.json();
}

export function getCoverUrl(
  type: "isbn" | "olid" | "id",
  value: string | number,
  size: "S" | "M" | "L" = "M"
): string {
  return `${COVERS_URL}/b/${type}/${value}-${size}.jpg`;
}

export function extractDescription(
  desc: string | { value: string } | undefined
): string | null {
  if (!desc) return null;
  if (typeof desc === "string") return desc;
  return desc.value ?? null;
}

export async function searchAuthors(
  query: string,
  limit = 20
): Promise<OLAuthorSearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${BASE_URL}/search/authors.json?${params}`, {
    headers,
  });
  if (!res.ok) throw new Error(`Author search failed: ${res.status}`);
  return res.json();
}

export function getAuthorPhotoUrl(
  photoId: number,
  size: "S" | "M" | "L" = "M"
): string {
  return `${COVERS_URL}/a/id/${photoId}-${size}.jpg`;
}

/** Rating promedio de Open Library para una obra */
export async function getWorkRatings(workId: string): Promise<{
  average: number;
  count: number;
} | null> {
  try {
    const id = workId.startsWith("/works/") ? workId : `/works/${workId}`;
    const res = await fetch(`${BASE_URL}${id}/ratings.json`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.summary?.average || !data.summary?.count) return null;
    return { average: data.summary.average, count: data.summary.count };
  } catch {
    return null;
  }
}
