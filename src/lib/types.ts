export type ShelfStatus =
  | 'want_to_read'
  | 'currently_reading'
  | 'read'
  | 'did_not_finish'

export type BookSource = 'hardcover' | 'openlibrary' | 'fallback'

export interface Book {
  id: string
  source: BookSource
  title: string
  author: string
  description: string
  releaseDate: string
  rating: number | null
  pages?: number | null
  coverUrl?: string
  genres: string[]
  isbn13?: string
  isbn10?: string
  slug: string
  openLibraryWorkKey?: string
  canonicalUrl?: string
}

export interface SearchResult {
  books: Book[]
  source: 'hardcover' | 'openlibrary' | 'mixed' | 'fallback'
  error?: string
}

export interface RetailerLink {
  name: string
  url: string
}
