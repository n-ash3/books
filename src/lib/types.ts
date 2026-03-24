export type ShelfStatus =
  | 'want_to_read'
  | 'currently_reading'
  | 'read'
  | 'did_not_finish'

export interface Book {
  title: string
  author: string
  description: string
  releaseDate: string
  rating: number | null
  isbn13?: string
  isbn10?: string
  slug: string
}

export interface SearchResult {
  books: Book[]
  source: 'hardcover' | 'fallback'
  error?: string
}

export interface RetailerLink {
  name: string
  url: string
}
