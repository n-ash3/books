import type { Book } from './types'

interface OpenLibrarySearchDoc {
  key?: string
  title?: string
  author_name?: string[]
  first_publish_year?: number
  number_of_pages_median?: number
  isbn?: string[]
  subject?: string[]
  cover_i?: number
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibrarySearchDoc[]
}

interface OpenLibraryWorkResponse {
  description?: string | { value?: string }
  subjects?: string[]
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function parseDescription(raw: unknown): string {
  if (typeof raw === 'string' && raw.trim()) {
    return raw
  }
  if (raw && typeof raw === 'object' && typeof (raw as { value?: unknown }).value === 'string') {
    const value = (raw as { value: string }).value.trim()
    if (value) {
      return value
    }
  }
  return 'No description available.'
}

function pickIsbn(isbns: string[] | undefined, size: 10 | 13): string | undefined {
  if (!isbns?.length) {
    return undefined
  }
  return isbns.find((isbn) => isbn.length === size)
}

function toBook(doc: OpenLibrarySearchDoc): Book | null {
  const title = doc.title?.trim()
  if (!title) {
    return null
  }

  const author = doc.author_name?.[0] ?? 'Unknown author'
  const releaseDate = doc.first_publish_year ? String(doc.first_publish_year) : 'Unknown'
  const workKey = doc.key
  const isbn13 = pickIsbn(doc.isbn, 13)
  const isbn10 = pickIsbn(doc.isbn, 10)
  const id = workKey ? `openlibrary:${workKey}` : `openlibrary:${slugify(`${title}-${author}`)}`
  const slug = slugify(title)
  const subjects = (doc.subject ?? []).slice(0, 4)
  const coverUrl = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : isbn13
      ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`
      : undefined

  return {
    id,
    source: 'openlibrary',
    title,
    author,
    description: 'No description available.',
    releaseDate,
    rating: null,
    pages: doc.number_of_pages_median ?? null,
    genres: subjects,
    coverUrl,
    isbn13,
    isbn10,
    slug,
    openLibraryWorkKey: workKey,
    canonicalUrl: workKey ? `https://openlibrary.org${workKey}` : undefined,
  }
}

async function hydrateWorkDescription(book: Book): Promise<Book> {
  if (!book.openLibraryWorkKey) {
    return book
  }

  try {
    const response = await fetch(`https://openlibrary.org${book.openLibraryWorkKey}.json`)
    if (!response.ok) {
      return book
    }
    const payload = (await response.json()) as OpenLibraryWorkResponse
    const description = parseDescription(payload.description)
    const genres = payload.subjects?.slice(0, 6) ?? book.genres

    return {
      ...book,
      description,
      genres,
    }
  } catch {
    return book
  }
}

export async function searchOpenLibraryBooks(query: string, limit = 20): Promise<Book[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
  )

  if (!response.ok) {
    throw new Error(`Open Library request failed (${response.status})`)
  }

  const payload = (await response.json()) as OpenLibrarySearchResponse
  const mapped = (payload.docs ?? []).map(toBook).filter((book): book is Book => Boolean(book))

  const top = mapped.slice(0, 12)
  const hydrated = await Promise.all(top.map((book) => hydrateWorkDescription(book)))
  return hydrated
}
