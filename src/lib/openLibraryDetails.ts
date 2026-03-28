import { buildOpenLibraryIsbnCoverUrl } from './coverFallback'
import type { Book } from './types'

interface OpenLibraryEditionResponse {
  key?: string
  publish_date?: string
  number_of_pages?: number
  publishers?: Array<string | { name?: string }>
  covers?: number[]
  works?: Array<{ key?: string }>
  isbn_10?: string[]
  isbn_13?: string[]
}

interface OpenLibraryWorkResponse {
  key?: string
  description?: string | { value?: string }
  subjects?: string[]
  covers?: number[]
  first_publish_date?: string
}

interface OpenLibraryRatingsResponse {
  summary?: {
    average?: number
    count?: number
  }
}

function parseDescription(raw: unknown): string | undefined {
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim()
  }
  if (raw && typeof raw === 'object' && typeof (raw as { value?: unknown }).value === 'string') {
    const value = (raw as { value: string }).value.trim()
    if (value) {
      return value
    }
  }
  return undefined
}

function extractYear(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }
  const match = value.match(/\d{4}/)
  return match?.[0]
}

function toPublisher(value: OpenLibraryEditionResponse['publishers']): string | undefined {
  if (!value?.length) {
    return undefined
  }
  const first = value[0]
  if (typeof first === 'string' && first.trim()) {
    return first.trim()
  }
  if (first && typeof first === 'object' && typeof first.name === 'string' && first.name.trim()) {
    return first.name.trim()
  }
  return undefined
}

function toWorkKey(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }
  if (value.startsWith('/works/')) {
    return value
  }
  return undefined
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function fetchOpenLibraryDetails(book: Book): Promise<Partial<Book> | null> {
  const preferredIsbn = book.isbn13 ?? book.isbn10
  const edition = preferredIsbn
    ? await fetchJson<OpenLibraryEditionResponse>(
        `https://openlibrary.org/isbn/${encodeURIComponent(preferredIsbn)}.json`,
      )
    : null

  const workKey = toWorkKey(book.openLibraryWorkKey) ?? toWorkKey(edition?.works?.[0]?.key)
  const [work, ratings] = await Promise.all([
    workKey
      ? fetchJson<OpenLibraryWorkResponse>(`https://openlibrary.org${workKey}.json`)
      : Promise.resolve(null),
    workKey
      ? fetchJson<OpenLibraryRatingsResponse>(`https://openlibrary.org${workKey}/ratings.json`)
      : Promise.resolve(null),
  ])

  const coverId = edition?.covers?.[0] ?? work?.covers?.[0]
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`
    : preferredIsbn
      ? buildOpenLibraryIsbnCoverUrl(preferredIsbn)
      : undefined

  const description = parseDescription(work?.description)
  const genres = work?.subjects?.slice(0, 10)
  const releaseDate = extractYear(edition?.publish_date) ?? extractYear(work?.first_publish_date)
  const publisher = toPublisher(edition?.publishers)
  const rating = typeof ratings?.summary?.average === 'number' ? ratings.summary.average : undefined
  const ratingCount = typeof ratings?.summary?.count === 'number' ? ratings.summary.count : undefined
  const isbn13 = edition?.isbn_13?.[0]
  const isbn10 = edition?.isbn_10?.[0]
  const canonicalUrl = workKey ? `https://openlibrary.org${workKey}` : undefined

  const details: Partial<Book> = {
    ...(description ? { description } : {}),
    ...(genres && genres.length > 0 ? { genres } : {}),
    ...(typeof edition?.number_of_pages === 'number' ? { pages: edition.number_of_pages } : {}),
    ...(publisher ? { publisher } : {}),
    ...(releaseDate ? { releaseDate } : {}),
    ...(typeof rating === 'number' ? { rating } : {}),
    ...(typeof ratingCount === 'number' ? { ratingCount } : {}),
    ...(coverUrl ? { coverUrl } : {}),
    ...(isbn13 ? { isbn13 } : {}),
    ...(isbn10 ? { isbn10 } : {}),
    ...(workKey ? { openLibraryWorkKey: workKey } : {}),
    ...(canonicalUrl ? { canonicalUrl } : {}),
  }

  return Object.keys(details).length > 0 ? details : null
}
