"use client";

import { useState } from "react";

interface AuthorAvatarProps {
  olid: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { container: "h-12 w-12", text: "text-xl" },
  md: { container: "h-20 w-20", text: "text-3xl" },
  lg: { container: "h-36 w-36 sm:h-48 sm:w-36", text: "text-5xl" },
};

export function AuthorAvatar({ olid, name, size = "sm" }: AuthorAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = `https://covers.openlibrary.org/a/olid/${olid}-M.jpg`;
  const { container, text } = sizes[size];
  const initial = name.charAt(0).toUpperCase();

  if (imgError) {
    return (
      <div
        className={`${container} flex flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ${text}`}
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={name}
      onError={() => setImgError(true)}
      className={`${container} flex-shrink-0 rounded-full object-cover object-top shadow-sm`}
    />
  );
}
