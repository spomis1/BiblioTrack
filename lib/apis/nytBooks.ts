const BASE_URL = "https://api.nytimes.com/svc/books/v3";

export interface NYTBook {
  rank: number;
  title: string;
  author: string;
  description: string;
  book_image: string;
  amazon_product_url: string;
  isbns: Array<{ isbn10: string; isbn13: string }>;
  weeks_on_list: number;
}

export interface NYTBestsellerList {
  list_name: string;
  list_name_encoded: string;
  bestsellers_date: string;
  published_date: string;
  books: NYTBook[];
}

function getApiKey(): string {
  const key = process.env.NYT_BOOKS_API_KEY;
  if (!key) throw new Error("NYT_BOOKS_API_KEY is not set");
  return key;
}

export async function getBestsellersList(
  listName = "hardcover-fiction"
): Promise<NYTBestsellerList> {
  const res = await fetch(
    `${BASE_URL}/lists/current/${listName}.json?api-key=${getApiKey()}`,
    { next: { revalidate: 3600 } } // cache 1 hour
  );
  if (!res.ok) throw new Error(`NYT Books API failed: ${res.status}`);
  const data = await res.json();
  return data.results;
}

export async function getBestsellerListNames(): Promise<
  Array<{ list_name: string; list_name_encoded: string }>
> {
  const res = await fetch(
    `${BASE_URL}/lists/names.json?api-key=${getApiKey()}`,
    { next: { revalidate: 86400 } } // cache 24 hours
  );
  if (!res.ok) throw new Error(`NYT Books API failed: ${res.status}`);
  const data = await res.json();
  return data.results;
}
