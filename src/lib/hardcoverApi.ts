import type { Book } from './types'

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

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function toBook(rawInput: Record<string, unknown>): Book | null {
  const raw = safeRecord(rawInput.book) ?? rawInput
  const title = pickString(raw.title, raw.name)
  const slug = pickString(raw.slug) || slugify(title)
  const description = pickString(raw.description, raw.summary) || 'No description available.'

  const releaseRaw = pickString(raw.release_date, raw.published_at, raw.publication_date)
  const releaseDate = releaseRaw ? releaseRaw.slice(0, 4) : 'Unknown'
  const rating = pickNumber(raw.rating, raw.average_rating, raw.community_rating)

  const editions = Array.isArray(raw.editions) ? raw.editions : []
  const firstEdition = safeRecord(editions[0])
  const isbn13 = pickString(firstEdition?.isbn_13, firstEdition?.isbn13) || undefined
  const isbn10 = pickString(firstEdition?.isbn_10, firstEdition?.isbn10) || undefined
  const coverUrl =
    pickString(firstEdition?.image, firstEdition?.cover_url, raw.image_url) || undefined
  const canonicalUrl = pickString(raw.url, raw.canonical_url) || `https://hardcover.app/books/${slug}`

  const contributions = Array.isArray(raw.contributions) ? raw.contributions : []
  const firstContribution = safeRecord(contributions[0])
  const authorObject = safeRecord(firstContribution?.author)
  const author = pickString(raw.author, authorObject?.name) || 'Unknown author'
  const genres =
    Array.isArray(raw.genres) && raw.genres.length
      ? raw.genres
          .map((genre) => safeRecord(genre))
          .map((genre) => pickString(genre?.name))
          .filter(Boolean)
          .slice(0, 6)
      : []
  const pageCount = pickNumber(raw.pages, firstEdition?.pages)
  const id = pickString(raw.id, raw.book_id) || `hardcover:${slug}:${isbn13 ?? 'no-isbn'}`

  if (!title) {
    return null
  }

  return {
    id,
    source: 'hardcover',
    title,
    slug,
    description,
    releaseDate,
    rating,
    ratingCount: null,
    reviewPreview: undefined,
    author,
    pages: pageCount,
    publisher: undefined,
    coverUrl,
    genres,
    isbn13,
    isbn10,
    canonicalUrl,
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

export function hasHardcoverToken(): boolean {
  return Boolean(HARDCOVER_TOKEN)
}

export async function searchHardcoverBooks(query: string): Promise<Book[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  if (!HARDCOVER_TOKEN) {
    return []
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
      throw new Error(`Hardcover request failed (${response.status})`)
    }

    const payload = (await response.json()) as RawSearchPayload
    const books = parseSearchResults(payload)
    return books
  } catch {
    throw new Error('Hardcover API unreachable.')
  }
}
