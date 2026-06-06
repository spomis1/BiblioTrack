"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "./StarRating";
import { rateBook } from "@/app/actions/ratings";
import { type BookData } from "@/app/actions/lists";
import { bayesianAverage } from "@/lib/utils";

interface RatingWidgetProps {
  bookData: BookData;
  /** Rating promedio de Open Library (puede ser null si no hay datos) */
  externalAvg: number | null;
  externalCount: number;
  /** Rating promedio de BiblioTrack users */
  btAvg: number;
  btCount: number;
  /** Rating personal del usuario (0 = sin rating) */
  initialUserRating: number;
  isLoggedIn: boolean;
}

export function RatingWidget({
  bookData,
  externalAvg,
  externalCount,
  btAvg: initialBtAvg,
  btCount: initialBtCount,
  initialUserRating,
  isLoggedIn,
}: RatingWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userRating, setUserRating] = useState(initialUserRating);
  const [btAvg, setBtAvg] = useState(initialBtAvg);
  const [btCount, setBtCount] = useState(initialBtCount);

  const displayRating = bayesianAverage(externalAvg, btAvg, btCount);
  const hasDisplay = displayRating > 0;

  function handleRate(score: number) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Optimistic: actualizar estrella del usuario inmediatamente
    setUserRating(score);

    startTransition(async () => {
      const result = await rateBook(bookData, score);
      setBtAvg(result.btAvg);
      setBtCount(result.btCount);
      setUserRating(result.userRating);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Rating de display (blended) */}
      <div className="flex items-center gap-2">
        <StarRating value={hasDisplay ? displayRating : 0} size="md" />
        {hasDisplay ? (
          <span className="text-sm text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {displayRating.toFixed(1)}
            </span>
          </span>
        ) : (
          <span className="text-sm text-zinc-400">Sin valoraciones aún</span>
        )}
      </div>

      {/* Rating personal del usuario */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {isLoggedIn ? "Tu nota:" : "Ingresá para puntuar"}
        </span>
        {isLoggedIn && (
          <>
            <StarRating
              value={userRating}
              size="sm"
              interactive={!isPending}
              onChange={handleRate}
            />
            {userRating > 0 && (
              <button
                onClick={() => handleRate(0)}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                disabled={isPending}
              >
                quitar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
