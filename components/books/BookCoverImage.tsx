"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface BookCoverImageProps {
  src: string;
  title: string;
}

/**
 * Renderiza una portada con fallback automático al icono de libro.
 * Usa <img> (no next/image) para poder interceptar onError en el cliente.
 */
export function BookCoverImage({ src, title }: BookCoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
        <BookOpen className="h-6 w-6 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
        <p className="line-clamp-4 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">
          {title}
        </p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
