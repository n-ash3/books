import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import type { Book } from './types'

const STORAGE_KEY = 'book-smart.books-cache.v2'

function mergeUniqueBooks(existing: Book[], incoming: Book[]): Book[] {
  const map = new Map<string, Book>()

  existing.forEach((book) => {
    map.set(book.id, book)
  })

  incoming.forEach((book) => {
    map.set(book.id, book)
  })

  return Array.from(map.values())
}

export function loadBookCache(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return FALLBACK_BOOKS
    }
    const parsed = JSON.parse(raw) as Book[]
    if (!Array.isArray(parsed)) {
      return FALLBACK_BOOKS
    }
    return mergeUniqueBooks(FALLBACK_BOOKS, parsed)
  } catch {
    return FALLBACK_BOOKS
  }
}

export function persistBookCache(books: Book[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

export function updateBookCacheWithResults(currentCache: Book[], results: Book[]): Book[] {
  const merged = mergeUniqueBooks(currentCache, results)
  persistBookCache(merged)
  return merged
}
