"use client";

import { useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { toggleListItem, type BookData, type ReadingListType } from "@/app/actions/lists";

const LIST_CONFIG: {
  type: ReadingListType;
  label: string;
  activeClass: string;
}[] = [
  {
    type: "WANT_TO_READ",
    label: "Quiero leer",
    activeClass:
      "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700",
  },
  {
    type: "READING",
    label: "Leyendo",
    activeClass:
      "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
  },
  {
    type: "READ",
    label: "Ya lo leí",
    activeClass:
      "bg-zinc-700 text-white border-zinc-700 hover:bg-zinc-800 dark:bg-zinc-300 dark:text-zinc-900 dark:border-zinc-300",
  },
];

interface ListButtonsProps {
  bookData: BookData;
  initialActiveLists: ReadingListType[];
  isLoggedIn: boolean;
}

export function ListButtons({
  bookData,
  initialActiveLists,
  isLoggedIn,
}: ListButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticLists, setOptimisticLists] = useOptimistic(
    initialActiveLists,
    (_current: ReadingListType[], next: ReadingListType[]) => next
  );

  function handleToggle(listType: ReadingListType) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Calcular estado optimista: mismo toggle que el servidor
    const isActive = optimisticLists.includes(listType);
    const nextLists: ReadingListType[] = isActive
      ? [] // deseleccionar
      : [listType]; // mover a esta lista

    startTransition(async () => {
      setOptimisticLists(nextLists);
      const result = await toggleListItem(bookData, listType);
      setOptimisticLists(result.activeLists);
    });
  }

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {LIST_CONFIG.map(({ type, label, activeClass }) => {
        const isActive = optimisticLists.includes(type);
        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            disabled={isPending}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? activeClass
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {isActive ? "✓ " : "+ "}
            {label}
          </button>
        );
      })}
    </div>
  );
}
