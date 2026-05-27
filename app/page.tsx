import Link from "next/link";
import { Search, BookOpen, Star, TrendingUp, Library } from "lucide-react";

const GENRES = [
  { name: "Ficción", slug: "fiction", emoji: "📖" },
  { name: "Ciencia Ficción", slug: "science-fiction", emoji: "🚀" },
  { name: "Misterio", slug: "mystery", emoji: "🔍" },
  { name: "Romance", slug: "romance", emoji: "💕" },
  { name: "No Ficción", slug: "non-fiction", emoji: "🧠" },
  { name: "Fantasía", slug: "fantasy", emoji: "🐉" },
  { name: "Terror", slug: "horror", emoji: "👻" },
  { name: "Historia", slug: "history", emoji: "📜" },
];

const FEATURES = [
  {
    icon: Search,
    title: "Descubrí libros nuevos",
    desc: "Más de 20 millones de títulos de todo el mundo para explorar.",
  },
  {
    icon: Star,
    title: "Puntuá y organizá",
    desc: "Listas personales, estrellas, y tu historial de lectura en un solo lugar.",
  },
  {
    icon: TrendingUp,
    title: "Bestsellers en tiempo real",
    desc: "Las listas del New York Times actualizadas cada semana.",
  },
  {
    icon: Library,
    title: "Clásicos gratis",
    desc: "Más de 70.000 libros en dominio público para leer sin costo.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-4 py-24 sm:px-6 sm:py-32 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-indigo-200" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Tu biblioteca digital,{" "}
            <span className="text-indigo-200">sin límites</span>
          </h1>
          <p className="mt-6 text-lg text-indigo-100 sm:text-xl max-w-2xl mx-auto">
            Descubrí millones de libros, organizá tu lectura, puntuá tus favoritos
            y encontrá tu próxima historia.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/books"
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors"
            >
              Explorar libros
            </Link>
            <Link
              href="/register"
              className="rounded-full border-2 border-white/40 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-12">
            Todo lo que necesitás en un solo lugar
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                  <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="py-16 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
            Explorá por género
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {GENRES.map((genre) => (
              <Link
                key={genre.slug}
                href={`/genres/${genre.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
              >
                <span className="text-3xl">{genre.emoji}</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{genre.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Empezá hoy, es gratis
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Creá tu cuenta y empezá a construir tu biblioteca personal.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-indigo-600 px-10 py-4 font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
