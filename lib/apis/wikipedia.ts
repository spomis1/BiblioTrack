const USER_AGENT = "BiblioTrack/1.0 (sebastianpomi@gmail.com)";

export interface WikiSummary {
  title: string;
  extract: string;
  content_urls?: {
    desktop?: { page?: string };
  };
}

async function fetchSummary(pageTitle: string, lang: string): Promise<WikiSummary | null> {
  try {
    const slug = encodeURIComponent(pageTitle.trim().replace(/ /g, "_"));
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`,
      {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 86400 }, // 24 h
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Descartar páginas de desambiguación o extractos muy cortos
    if (data.type === "disambiguation" || !data.extract || data.extract.length < 80) return null;
    return data as WikiSummary;
  } catch {
    return null;
  }
}

/**
 * Obtiene el resumen de Wikipedia de un autor.
 * Prioriza español; si no hay, cae en inglés.
 *
 * @param name  Nombre del autor (ej: "Paul Auster")
 * @param wikiUrl URL de Wikipedia que viene de Open Library (ej: "https://en.wikipedia.org/wiki/Paul_Auster")
 */
export async function getAuthorWikiSummary(
  name: string,
  wikiUrl?: string
): Promise<WikiSummary | null> {
  // Extraer el título de la URL de OL si está disponible
  let pageTitle = name;
  if (wikiUrl) {
    const match = wikiUrl.match(/\/wiki\/([^#?]+)/);
    if (match) pageTitle = decodeURIComponent(match[1].replace(/_/g, " "));
  }

  // Intentar español primero, luego inglés
  const es = await fetchSummary(pageTitle, "es");
  if (es) return es;
  return fetchSummary(pageTitle, "en");
}
