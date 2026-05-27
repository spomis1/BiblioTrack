import Image from "next/image";
import Link from "next/link";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  avgRating: number;
  ratingsCount: number;
  publishedYear?: number | null;
  className?: string;
}

export function BookCard({
  id,
  title,
  author,
  coverUrl,
  avgRating,
  ratingsCount,
  publishedYear,
  className,
}: BookCardProps) {
  return (
    <Link
      href={`/books/${id}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg p-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        className
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 shadow-sm group-hover:shadow-md transition-shadow">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <span className="text-3xl">📚</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <p className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
          {title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{author}</p>
        {avgRating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating value={avgRating} size="sm" />
            <span className="text-xs text-zinc-400">
              {avgRating.toFixed(1)} ({ratingsCount})
            </span>
          </div>
        )}
        {publishedYear && (
          <span className="text-xs text-zinc-400">{publishedYear}</span>
        )}
      </div>
    </Link>
  );
}
