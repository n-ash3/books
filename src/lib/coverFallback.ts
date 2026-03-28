import type { Book } from './types'

type CoverSize = 'S' | 'M' | 'L'

interface OpenLibrarySearchDoc {
  cover_i?: number
  isbn?: string[]
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibrarySearchDoc[]
}

function normalizeCoverUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`
  }
  return url
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
}

export function buildOpenLibraryIsbnCoverUrl(isbn: string, size: CoverSize = 'L'): string {
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${size}.jpg?default=false`
}

export function resolveCoverCandidates(
  book: Pick<Book, 'coverUrl' | 'isbn13' | 'isbn10'>,
  size: CoverSize = 'L',
): string[] {
  return unique([
    normalizeCoverUrl(book.coverUrl),
    book.isbn13 ? buildOpenLibraryIsbnCoverUrl(book.isbn13, size) : undefined,
    book.isbn10 ? buildOpenLibraryIsbnCoverUrl(book.isbn10, size) : undefined,
  ])
}

export async function fetchOpenLibraryCoverCandidate(
  book: Pick<Book, 'title' | 'author' | 'isbn13' | 'isbn10'>,
  size: CoverSize = 'L',
): Promise<string | null> {
  const query = new URLSearchParams({
    title: book.title,
    author: book.author,
    limit: '1',
  })

  try {
    const response = await fetch(`https://openlibrary.org/search.json?${query.toString()}`)
    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as OpenLibrarySearchResponse
    const firstDoc = payload.docs?.[0]
    if (!firstDoc) {
      return null
    }

    if (typeof firstDoc.cover_i === 'number') {
      return `https://covers.openlibrary.org/b/id/${firstDoc.cover_i}-${size}.jpg?default=false`
    }

    const isbn = firstDoc.isbn?.find((value) => value.length === 13) ?? firstDoc.isbn?.[0]
    if (isbn) {
      return buildOpenLibraryIsbnCoverUrl(isbn, size)
    }

    return null
  } catch {
    return null
  }
}

export function hasAnyCoverCandidate(book: Pick<Book, 'coverUrl' | 'isbn13' | 'isbn10'>): boolean {
  return resolveCoverCandidates(book).length > 0
}
