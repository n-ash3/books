import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import type { Book, SearchResult } from './types'

const HARDCOVER_ENDPOINT =
  import.meta.env.VITE_HARDCOVER_GRAPHQL_URL ?? 'https://api.hardcover.app/v1/graphql'

const HARDCOVER_TOKEN = import.meta.env.VITE_HARDCOVER_API_TOKEN

interface RawSearchPayload {
  data?: {
    search?:
      | {
          results?: string
        }
      | Array<{
          results?: string
        }>
  }
}

function safeRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return ''
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }
  return null
}

function toBook(rawInput: Record<string, unknown>): Book | null {
  const raw = safeRecord(rawInput.book) ?? rawInput
  const title = pickString(raw.title, raw.name)
  const slug = pickString(raw.slug) || title.toLowerCase().replaceAll(' ', '-')
  const description = pickString(raw.description, raw.summary) || 'No description available.'

  const releaseRaw = pickString(raw.release_date, raw.published_at, raw.publication_date)
  const releaseDate = releaseRaw ? releaseRaw.slice(0, 4) : 'Unknown'
  const rating = pickNumber(raw.rating, raw.average_rating, raw.community_rating)

  const editions = Array.isArray(raw.editions) ? raw.editions : []
  const firstEdition = safeRecord(editions[0])
  const isbn13 = pickString(firstEdition?.isbn_13, firstEdition?.isbn13) || undefined
  const isbn10 = pickString(firstEdition?.isbn_10, firstEdition?.isbn10) || undefined

  const contributions = Array.isArray(raw.contributions) ? raw.contributions : []
  const firstContribution = safeRecord(contributions[0])
  const authorObject = safeRecord(firstContribution?.author)
  const author = pickString(raw.author, authorObject?.name) || 'Unknown author'

  if (!title) {
    return null
  }

  return {
    title,
    slug,
    description,
    releaseDate,
    rating,
    author,
    isbn13,
    isbn10,
  }
}

function parseSearchResults(payload: RawSearchPayload): Book[] {
  const rawSearch = payload.data?.search
  const encodedResults = Array.isArray(rawSearch) ? rawSearch[0]?.results : rawSearch?.results
  if (!encodedResults) {
    return []
  }

  try {
    const decoded = JSON.parse(encodedResults) as Array<Record<string, unknown>>
    return decoded.map(toBook).filter((book): book is Book => Boolean(book))
  } catch {
    return []
  }
}

function fallbackResult(error?: string): SearchResult {
  return {
    books: FALLBACK_BOOKS,
    source: 'fallback',
    error,
  }
}

export async function searchBooks(query: string): Promise<SearchResult> {
  const trimmed = query.trim()
  if (!trimmed) {
    return fallbackResult()
  }

  if (!HARDCOVER_TOKEN) {
    return fallbackResult('No Hardcover API token set. Using local fallback data.')
  }

  const operation = `
    query SearchBooks($query: String!) {
      search(query: $query, query_type: "Book", per_page: 12, page: 1) {
        results
      }
    }
  `

  try {
    const response = await fetch(HARDCOVER_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: HARDCOVER_TOKEN,
      },
      body: JSON.stringify({
        query: operation,
        variables: { query: trimmed },
      }),
    })

    if (!response.ok) {
      return fallbackResult(`Hardcover request failed (${response.status}). Showing fallback data.`)
    }

    const payload = (await response.json()) as RawSearchPayload
    const books = parseSearchResults(payload)

    if (books.length === 0) {
      return fallbackResult('No Hardcover matches found. Showing fallback picks.')
    }

    return {
      books,
      source: 'hardcover',
    }
  } catch {
    return fallbackResult('Hardcover API unreachable. Showing fallback picks.')
  }
}
