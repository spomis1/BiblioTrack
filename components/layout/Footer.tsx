import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold">BiblioTrack</span>
          </Link>
          <p className="text-sm text-zinc-400">
            Datos de{" "}
            <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">
              Open Library
            </a>
            {", "}
            <a href="https://books.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">
              Google Books
            </a>
            {" y "}
            <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">
              Project Gutenberg
            </a>
          </p>
          <p className="text-sm text-zinc-400">© 2026 BiblioTrack</p>
        </div>
      </div>
    </footer>
  );
}
