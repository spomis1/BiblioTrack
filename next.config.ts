import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Open Library — portadas de libros
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        // Google Books — portadas alternativas
        protocol: "https",
        hostname: "books.google.com",
      },
      {
        // Google Books CDN
        protocol: "http",
        hostname: "books.google.com",
      },
    ],
  },
};

export default nextConfig;
