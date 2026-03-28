import type { Book } from './types'

interface GoogleBookVolumeInfo {
  title?: string
  authors?: string[]
  description?: string
  averageRating?: number
  ratingsCount?: number
  pageCount?: number
  publishedDate?: string
  publisher?: string
  categories?: string[]
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
  }
  industryIdentifiers?: Array<{
    type?: string
    identifier?: string
  }>
  infoLink?: string
}

interface GoogleBookItem {
  id?: string
  volumeInfo?: GoogleBookVolumeInfo
}

interface GoogleBooksSearchResponse {
  items?: GoogleBookItem[]
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function findIdentifier(
  identifiers: GoogleBookVolumeInfo['industryIdentifiers'],
  type: string,
): string | undefined {
  if (!identifiers?.length) {
    return undefined
  }
  return identifiers.find((entry) => entry.type === type)?.identifier
}

function mapGoogleItem(item: GoogleBookItem): Book | null {
  const volume = item.volumeInfo
  if (!volume?.title?.trim()) {
    return null
  }

  const title = volume.title.trim()
  const author = volume.authors?.[0] ?? 'Unknown author'
  const slug = slugify(title)
  const isbn13 = findIdentifier(volume.industryIdentifiers, 'ISBN_13')
  const isbn10 = findIdentifier(volume.industryIdentifiers, 'ISBN_10')

  return {
    id: `googlebooks:${item.id ?? `${slug}-${author}`}`,
    source: 'googlebooks',
    title,
    author,
    description: volume.description?.trim() || 'No description available.',
    releaseDate: volume.publishedDate?.slice(0, 4) || 'Unknown',
    rating: typeof volume.averageRating === 'number' ? volume.averageRating : null,
    ratingCount: typeof volume.ratingsCount === 'number' ? volume.ratingsCount : null,
    reviewPreview:
      typeof volume.description === 'string' && volume.description.length > 180
        ? `${volume.description.slice(0, 180)}...`
        : undefined,
    pages: typeof volume.pageCount === 'number' ? volume.pageCount : null,
    publisher: volume.publisher?.trim(),
    coverUrl: volume.imageLinks?.thumbnail ?? volume.imageLinks?.smallThumbnail,
    genres: (volume.categories ?? []).slice(0, 6),
    isbn13,
    isbn10,
    slug,
    canonicalUrl: volume.infoLink,
  }
}

export async function searchGoogleBooks(query: string, limit = 20): Promise<Book[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=${Math.min(
      Math.max(limit, 1),
      40,
    )}`,
  )

  if (!response.ok) {
    throw new Error(`Google Books request failed (${response.status})`)
  }

  const payload = (await response.json()) as GoogleBooksSearchResponse
  return (payload.items ?? [])
    .map(mapGoogleItem)
    .filter((book): book is Book => Boolean(book))
}
