"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export type ReadingListType = "WANT_TO_READ" | "READING" | "READ";

export interface BookData {
  openLibraryId: string;
  title: string;
  coverUrl?: string | null;
  publishedYear?: number | null;
}

const LIST_NAMES: Record<ReadingListType, string> = {
  WANT_TO_READ: "Quiero leer",
  READING: "Leyendo",
  READ: "Leído",
};

/** Genera un username único basado en el email + sufijo del UUID de Supabase */
function buildUsername(email: string, supabaseId: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  const suffix = supabaseId.replace(/-/g, "").slice(-8);
  return `${base}_${suffix}`;
}

/**
 * Agrega o quita un libro de una lista.
 * - Si el libro ya está en esa lista → lo quita (toggle).
 * - Si el libro está en otra lista estándar → lo mueve a la nueva.
 * - Si no estaba en ninguna → lo agrega.
 * Devuelve las listas activas del libro tras la operación.
 */
export async function toggleListItem(
  bookData: BookData,
  listType: ReadingListType
): Promise<{ activeLists: ReadingListType[] }> {
  // 1. Verificar autenticación
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 2. Upsert User en nuestra DB (primera vez que interactúa)
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

  // 3. Upsert Book en nuestra DB (por openLibraryId)
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

  // 4. Obtener/crear la lista del tipo solicitado
  let targetList = await db.readingList.findFirst({
    where: { userId: dbUser.id, type: listType },
  });
  if (!targetList) {
    targetList = await db.readingList.create({
      data: {
        userId: dbUser.id,
        type: listType,
        name: LIST_NAMES[listType],
      },
    });
  }

  // 5. Toggle: si ya estaba en esta lista, lo sacamos; si no, lo movemos acá
  const existingInTarget = await db.listItem.findUnique({
    where: { listId_bookId: { listId: targetList.id, bookId: book.id } },
  });

  if (existingInTarget) {
    // Ya estaba → quitar (deseleccionar)
    await db.listItem.delete({ where: { id: existingInTarget.id } });
  } else {
    // No estaba → sacar de otras listas estándar y agregar a esta
    const otherStandardTypes: ReadingListType[] = ["WANT_TO_READ", "READING", "READ"].filter(
      (t) => t !== listType
    ) as ReadingListType[];

    const otherLists = await db.readingList.findMany({
      where: { userId: dbUser.id, type: { in: otherStandardTypes } },
    });

    if (otherLists.length > 0) {
      await db.listItem.deleteMany({
        where: {
          bookId: book.id,
          listId: { in: otherLists.map((l) => l.id) },
        },
      });
    }

    await db.listItem.create({
      data: { listId: targetList.id, bookId: book.id },
    });
  }

  // 6. Devolver listas activas actualizadas
  const activeItems = await db.listItem.findMany({
    where: {
      bookId: book.id,
      list: { userId: dbUser.id },
    },
    include: { list: true },
  });

  const activeLists = activeItems
    .map((item) => item.list.type)
    .filter((t): t is ReadingListType =>
      ["WANT_TO_READ", "READING", "READ"].includes(t)
    );

  // refresh() invalida el router client-side sin forzar navegación
  refresh();

  return { activeLists };
}

/** Lee las listas activas de un libro para el usuario actual (sin mutar nada) */
export async function getBookActiveLists(
  openLibraryId: string
): Promise<ReadingListType[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const dbUser = await db.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return [];

  const book = await db.book.findUnique({ where: { openLibraryId } });
  if (!book) return [];

  const items = await db.listItem.findMany({
    where: { bookId: book.id, list: { userId: dbUser.id } },
    include: { list: true },
  });

  return items
    .map((i) => i.list.type)
    .filter((t): t is ReadingListType =>
      ["WANT_TO_READ", "READING", "READ"].includes(t)
    );
}
