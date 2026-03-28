import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import { hasAnyCoverCandidate } from './coverFallback'
import { searchGoogleBooks } from './googleBooksApi'
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
      `${book.title.toLowerCase()}::${book.author.toLowerCase()}`

    if (seen.has(key)) {
      return
    }

    seen.add(key)
    result.push(book)
  })

  return result
}

function isEmpty(value: string | undefined): boolean {
  return !value || !value.trim() || value === 'Unknown'
}

function takeIfMissing(base: string | undefined, incoming: string | undefined): string | undefined {
  if (!isEmpty(base)) {
    return base
  }
  return incoming
}

function mergeBookFields(primary: Book, fallback: Book): Book {
  return {
    ...primary,
    description:
      primary.description && primary.description !== 'No description available.'
        ? primary.description
        : fallback.description,
    releaseDate:
      !isEmpty(primary.releaseDate) && primary.releaseDate !== 'Unknown'
        ? primary.releaseDate
        : fallback.releaseDate,
    rating: primary.rating ?? fallback.rating,
    ratingCount: primary.ratingCount ?? fallback.ratingCount ?? null,
    reviewPreview: primary.reviewPreview ?? fallback.reviewPreview,
    pages: primary.pages ?? fallback.pages ?? null,
    publisher: takeIfMissing(primary.publisher, fallback.publisher),
    coverUrl: takeIfMissing(primary.coverUrl, fallback.coverUrl),
    genres: primary.genres.length > 0 ? primary.genres : fallback.genres,
    isbn13: primary.isbn13 ?? fallback.isbn13,
    isbn10: primary.isbn10 ?? fallback.isbn10,
    canonicalUrl: takeIfMissing(primary.canonicalUrl, fallback.canonicalUrl),
  }
}

function mergeProviderResults(
  hardcoverBooks: Book[],
  googleBooks: Book[],
  openLibraryBooks: Book[],
): Book[] {
  const googleIndex = new Map<string, Book>()
  const openLibraryIndex = new Map<string, Book>()

  const buildKey = (book: Book): string =>
    (book.isbn13 ?? book.isbn10 ?? `${book.title.toLowerCase()}::${book.author.toLowerCase()}`).trim()

  googleBooks.forEach((book) => {
    googleIndex.set(buildKey(book), book)
  })

  openLibraryBooks.forEach((book) => {
    openLibraryIndex.set(buildKey(book), book)
  })

  const mergedHardcover = hardcoverBooks.map((hardcoverBook) => {
    const key = buildKey(hardcoverBook)
    const withGoogle = googleIndex.get(key)
    const withOpenLibrary = openLibraryIndex.get(key)

    let merged = hardcoverBook
    if (withGoogle) {
      merged = mergeBookFields(merged, withGoogle)
      googleIndex.delete(key)
    }
    if (withOpenLibrary) {
      merged = mergeBookFields(merged, withOpenLibrary)
      openLibraryIndex.delete(key)
    }
    return merged
  })

  const remainingGoogle = Array.from(googleIndex.values())
  const mergedGoogle = remainingGoogle.map((googleBook) => {
    const key = buildKey(googleBook)
    const withOpenLibrary = openLibraryIndex.get(key)
    if (withOpenLibrary) {
      openLibraryIndex.delete(key)
      return mergeBookFields(googleBook, withOpenLibrary)
    }
    return googleBook
  })

  const remainingOpenLibrary = Array.from(openLibraryIndex.values())
  return dedupeBooks([...mergedHardcover, ...mergedGoogle, ...remainingOpenLibrary])
}

export async function searchBooks(query: string): Promise<SearchResult> {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      books: FALLBACK_BOOKS,
      source: 'fallback',
    }
  }

  // Priority order: Hardcover first, then Google Books, then Open Library.
  const hardcoverTask = hasHardcoverToken()
    ? searchHardcoverBooks(trimmed)
    : Promise.resolve<Book[]>([])
  const googleTask = searchGoogleBooks(trimmed)
  const openLibraryTask = searchOpenLibraryBooks(trimmed)

  const [hardcoverResult, googleResult, openLibraryResult] = await Promise.allSettled([
    hardcoverTask,
    googleTask,
    openLibraryTask,
  ])

  const hardcoverBooks = hardcoverResult.status === 'fulfilled' ? hardcoverResult.value : []
  const googleBooks = googleResult.status === 'fulfilled' ? googleResult.value : []
  const openLibraryBooks = openLibraryResult.status === 'fulfilled' ? openLibraryResult.value : []

  const merged = mergeProviderResults(hardcoverBooks, googleBooks, openLibraryBooks).filter((book) =>
    hasAnyCoverCandidate(book),
  )

  const failed = [hardcoverResult, googleResult, openLibraryResult].filter(
    (entry) => entry.status === 'rejected',
  ).length

  if (merged.length > 0) {
    const hasHardcover = hardcoverBooks.length > 0
    const hasGoogleBooks = googleBooks.length > 0
    const hasOpenLibrary = openLibraryBooks.length > 0

    let source: SearchResult['source'] = 'fallback'
    if (hasHardcover && (hasGoogleBooks || hasOpenLibrary)) {
      source = 'mixed'
    } else if (hasHardcover) {
      source = 'hardcover'
    } else if (hasGoogleBooks) {
      source = 'googlebooks'
    } else if (hasOpenLibrary) {
      source = 'openlibrary'
    }

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

