import type { Book, GenreCount } from './types'

const GENRE_FALLBACKS: GenreCount[] = [
  { name: 'Fantasy', count: 220729 },
  { name: 'Fiction', count: 231214 },
  { name: 'Young Adult', count: 148786 },
  { name: 'Adventure', count: 105095 },
  { name: 'Science Fiction', count: 100893 },
  { name: 'Classics', count: 82319 },
  { name: 'Romance', count: 43619 },
  { name: 'History', count: 62677 },
]

interface OpenLibrarySubjectResponse {
  key?: string
  name?: string
  work_count?: number
}

interface OpenLibrarySubjectBook {
  key?: string
  title?: string
  authors?: Array<{ name?: string }>
  first_publish_year?: number
  subject?: string[]
  cover_id?: number
  ratings_average?: number
  ratings_count?: number
  number_of_pages_median?: number
}

interface OpenLibrarySubjectBooksResponse {
  works?: OpenLibrarySubjectBook[]
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function toBook(work: OpenLibrarySubjectBook, genre: string): Book | null {
  const title = work.title?.trim()
  if (!title) {
    return null
  }

  const author = work.authors?.[0]?.name ?? 'Unknown author'
  const key = work.key ?? `${slugify(title)}-${slugify(author)}`
  const coverUrl = work.cover_id
    ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
    : undefined

  const normalizedKey = key.startsWith('/works/') ? key : undefined

  return {
    id: `openlibrary:${key}`,
    source: 'openlibrary',
    title,
    author,
    description: 'Open details to view full metadata and external links.',
    releaseDate: work.first_publish_year ? String(work.first_publish_year) : 'Unknown',
    rating: typeof work.ratings_average === 'number' ? work.ratings_average : null,
    ratingCount: typeof work.ratings_count === 'number' ? work.ratings_count : null,
    reviewPreview: undefined,
    pages: typeof work.number_of_pages_median === 'number' ? work.number_of_pages_median : null,
    publisher: undefined,
    coverUrl,
    genres: work.subject?.slice(0, 6) ?? [genre],
    slug: slugify(title),
    openLibraryWorkKey: normalizedKey,
    canonicalUrl: normalizedKey ? `https://openlibrary.org${normalizedKey}` : undefined,
  }
}

export async function fetchGenres(limit = 12): Promise<GenreCount[]> {
  try {
    const response = await fetch(`https://openlibrary.org/subjects.json?limit=${limit}`)
    if (!response.ok) {
      return GENRE_FALLBACKS.slice(0, limit)
    }
    const payload = (await response.json()) as { subjects?: OpenLibrarySubjectResponse[] }
    const parsed = (payload.subjects ?? [])
      .map((subject) => ({
        name: subject.name?.trim() ?? '',
        count: subject.work_count ?? 0,
      }))
      .filter((subject) => subject.name.length > 0)
      .slice(0, limit)

    return parsed.length > 0 ? parsed : GENRE_FALLBACKS.slice(0, limit)
  } catch {
    return GENRE_FALLBACKS.slice(0, limit)
  }
}

export async function fetchBooksByGenre(genre: string, limit = 24): Promise<Book[]> {
  const slug = slugify(genre)
  const endpoint = `https://openlibrary.org/subjects/${slug}.json?limit=${limit}`

  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as OpenLibrarySubjectBooksResponse
    return (payload.works ?? [])
      .map((work) => toBook(work, genre))
      .filter((book): book is Book => Boolean(book))
  } catch {
    return []
  }
}

export async function fetchBooksByGenres(genres: string[], limitPerGenre = 16): Promise<Book[]> {
  const uniqueGenres = Array.from(new Set(genres.map((genre) => genre.trim()).filter(Boolean)))
  if (uniqueGenres.length === 0) {
    return []
  }

  const all = await Promise.all(uniqueGenres.map((genre) => fetchBooksByGenre(genre, limitPerGenre)))
  const merged = all.flat()
  const seen = new Set<string>()
  const deduped: Book[] = []

  merged.forEach((book) => {
    const key = book.isbn13 ?? book.isbn10 ?? `${book.title.toLowerCase()}::${book.author.toLowerCase()}`
    if (seen.has(key)) {
      return
    }
    seen.add(key)
    deduped.push(book)
  })

  return deduped
}
