import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function buildCoverUrl(
  isbn: string | null,
  olid: string | null,
  size: "S" | "M" | "L" = "M"
): string {
  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
  }
  if (olid) {
    return `https://covers.openlibrary.org/b/olid/${olid}-${size}.jpg`;
  }
  return "/placeholder-book.svg";
}

/**
 * Promedio bayesiano: combina un rating externo (Open Library / Google Books)
 * con los ratings propios de BiblioTrack para evitar sesgos con pocos votos.
 *
 * W = cuántos "votos equivalentes" vale el rating externo (default 20).
 * Con pocos votes propios, el externo domina. Con muchos, los propios dominan.
 */
export function bayesianAverage(
  externalAvg: number | null,
  btAvg: number,
  btCount: number,
  W = 20
): number {
  if (!externalAvg && btCount === 0) return 0;
  if (!externalAvg) return btAvg;
  if (btCount === 0) return externalAvg;
  return (externalAvg * W + btAvg * btCount) / (W + btCount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
