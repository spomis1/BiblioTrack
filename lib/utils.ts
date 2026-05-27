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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
