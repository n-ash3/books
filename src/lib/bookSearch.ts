import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import { hasHardcoverToken, searchHardcoverBooks } from './hardcoverApi'
import { searchOpenLibraryBooks } from './openLibraryApi'
import type { Book, SearchResult } from './types'

function dedupeBooks(books: Book[]): Book[] {
  const seen = new Set<string>()
  const result: Book[] = []

  books.forEach((book) => {
    const key =
      book.isbn13 ??
      book.isbn10 ??
      `${book.title.toLowerCase()}::${book.author.toLowerCase()}::${book.releaseDate}`

    if (seen.has(key)) {
      return
    }

    seen.add(key)
    result.push(book)
  })

  return result
}

export async function searchBooks(query: string): Promise<SearchResult> {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      books: FALLBACK_BOOKS,
      source: 'fallback',
    }
  }

  const tasks: Array<Promise<{ source: 'hardcover' | 'openlibrary'; books: Book[] }>> = []

  if (hasHardcoverToken()) {
    tasks.push(
      searchHardcoverBooks(trimmed).then((books) => ({
        source: 'hardcover',
        books,
      })),
    )
  }

  tasks.push(
    searchOpenLibraryBooks(trimmed).then((books) => ({
      source: 'openlibrary',
      books,
    })),
  )

  const settled = await Promise.allSettled(tasks)

  const successful = settled
    .filter((entry): entry is PromiseFulfilledResult<{ source: 'hardcover' | 'openlibrary'; books: Book[] }> => entry.status === 'fulfilled')
    .map((entry) => entry.value)

  const failed = settled.filter((entry) => entry.status === 'rejected').length

  const merged = dedupeBooks(successful.flatMap((entry) => entry.books))

  if (merged.length > 0) {
    const hasHardcover = successful.some((entry) => entry.source === 'hardcover' && entry.books.length > 0)
    const hasOpenLibrary = successful.some(
      (entry) => entry.source === 'openlibrary' && entry.books.length > 0,
    )

    const source: SearchResult['source'] =
      hasHardcover && hasOpenLibrary
        ? 'mixed'
        : hasHardcover
          ? 'hardcover'
          : hasOpenLibrary
            ? 'openlibrary'
            : 'fallback'

    const error =
      failed > 0
        ? 'Some providers were unavailable, but partial results are shown.'
        : undefined

    return {
      books: merged.slice(0, 24),
      source,
      error,
    }
  }

  return {
    books: FALLBACK_BOOKS,
    source: 'fallback',
    error: 'No provider returned results. Showing fallback picks.',
  }
}

