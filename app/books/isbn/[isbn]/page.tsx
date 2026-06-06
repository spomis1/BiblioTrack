import { redirect, notFound } from "next/navigation";

/**
 * Recibe un ISBN (10 ó 13) y redirige a la página de obra de Open Library.
 * Usado como destino de links desde la lista de obras de Google Books.
 */
async function resolveOLWorkId(isbn: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as Record<string, { works?: Array<{ key: string }> }>;
    const workKey = data[`ISBN:${isbn}`]?.works?.[0]?.key;
    if (!workKey) return null;
    return workKey.replace("/works/", "");
  } catch {
    return null;
  }
}

export default async function IsbnRedirectPage({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {
  const { isbn } = await params;
  const workId = await resolveOLWorkId(isbn);
  if (!workId) notFound();
  redirect(`/books/${workId}`);
}
