"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { type BookData } from "./lists";

function buildUsername(email: string, supabaseId: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  const suffix = supabaseId.replace(/-/g, "").slice(-8);
  return `${base}_${suffix}`;
}

export interface RateBookResult {
  btAvg: number;
  btCount: number;
  userRating: number;
}

/**
 * Guarda o actualiza el rating del usuario para un libro.
 * Si el score es 0 → elimina el rating (des-puntuar).
 */
export async function rateBook(
  bookData: BookData,
  score: number
): Promise<RateBookResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  if (score < 0 || score > 5) throw new Error("Rating inválido");

  // Upsert User
  const username = buildUsername(user.email!, user.id);
  const dbUser = await db.user.upsert({
    where: { supabaseId: user.id },
    create: {
      supabaseId: user.id,
      email: user.email!,
      username,
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        null,
    },
    update: { email: user.email! },
  });

  // Upsert Book
  const book = await db.book.upsert({
    where: { openLibraryId: bookData.openLibraryId },
    create: {
      openLibraryId: bookData.openLibraryId,
      title: bookData.title,
      coverUrl: bookData.coverUrl ?? null,
      publishedYear: bookData.publishedYear ?? null,
    },
    update: {
      title: bookData.title,
      coverUrl: bookData.coverUrl ?? null,
    },
  });

  if (score === 0) {
    // Eliminar rating existente
    await db.rating.deleteMany({
      where: { userId: dbUser.id, bookId: book.id },
    });
  } else {
    // Upsert rating
    await db.rating.upsert({
      where: { userId_bookId: { userId: dbUser.id, bookId: book.id } },
      create: { userId: dbUser.id, bookId: book.id, score },
      update: { score },
    });
  }

  // Recalcular avgRating y ratingsCount en el Book
  const allRatings = await db.rating.findMany({
    where: { bookId: book.id },
    select: { score: true },
  });

  const btCount = allRatings.length;
  const btAvg =
    btCount > 0
      ? allRatings.reduce((sum, r) => sum + r.score, 0) / btCount
      : 0;

  await db.book.update({
    where: { id: book.id },
    data: { avgRating: btAvg, ratingsCount: btCount },
  });

  revalidatePath(`/books/${bookData.openLibraryId}`);

  return { btAvg, btCount, userRating: score };
}
