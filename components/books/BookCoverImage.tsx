"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface BookCoverImageProps {
  src: string;
  /** URL de respaldo (p.ej. portada de Google Books) si la principal falla */
  fallback?: string | null;
  title: string;
}

function NoCover({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
      <BookOpen className="h-6 w-6 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
      <p className="line-clamp-4 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
    </div>
  );
}

/**
 * Renderiza una portada con doble fallback:
 * 1. Intenta `src` (normalmente OL por ISBN)
 * 2. Si falla o es el GIF 1×1 de OL → intenta `fallback` (portada de GB)
 * 3. Si también falla → muestra ícono de libro + título
 *
 * Usa <img> en vez de next/image para poder interceptar onLoad/onError.
 */
export function BookCoverImage({ src, fallback, title }: BookCoverImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  function tryFallback() {
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      setFailed(true);
    }
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // OL devuelve un GIF transparente de 1×1 px cuando no tiene la portada
    if (e.currentTarget.naturalWidth <= 1) {
      tryFallback();
    }
  };

  if (failed) return <NoCover title={title} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={title}
      onLoad={handleLoad}
      onError={tryFallback}
      className="h-full w-full object-cover"
    />
  );
}
