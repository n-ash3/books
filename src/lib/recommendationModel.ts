import type { Book } from './types'

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'this',
  'to',
  'with',
])

export interface RecommendationResult {
  book: Book
  score: number
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) {
    return 0
  }
  let intersection = 0
  left.forEach((item) => {
    if (right.has(item)) {
      intersection += 1
    }
  })
  const union = left.size + right.size - intersection
  return union === 0 ? 0 : intersection / union
}

function parseReleaseYear(value: string): number | null {
  const match = value.match(/\d{4}/)
  return match ? Number(match[0]) : null
}

function scoreCandidate(favorite: Book, candidate: Book): number {
  const favoriteGenres = new Set(favorite.genres.map(normalize).filter(Boolean))
  const candidateGenres = new Set(candidate.genres.map(normalize).filter(Boolean))
  const genreScore = jaccard(favoriteGenres, candidateGenres) * 45

  const favoriteTerms = new Set(tokenize(`${favorite.title} ${favorite.description}`))
  const candidateTerms = new Set(tokenize(`${candidate.title} ${candidate.description}`))
  const languageScore = jaccard(favoriteTerms, candidateTerms) * 35

  const sameAuthorScore = normalize(favorite.author) === normalize(candidate.author) ? 12 : 0

  const ratingScore = (candidate.rating ?? 0) * 1.2
  const popularityScore = Math.min(Math.log10((candidate.ratingCount ?? 0) + 1) * 2.5, 8)

  const favoriteYear = parseReleaseYear(favorite.releaseDate)
  const candidateYear = parseReleaseYear(candidate.releaseDate)
  const recencyDistance = favoriteYear && candidateYear ? Math.abs(favoriteYear - candidateYear) : 12
  const timelineScore = Math.max(0, 6 - recencyDistance * 0.35)

  return genreScore + languageScore + sameAuthorScore + ratingScore + popularityScore + timelineScore
}

export function findFavoriteBook(input: string, books: Book[]): Book | null {
  const trimmed = normalize(input)
  if (!trimmed) {
    return null
  }

  const exact = books.find((book) => normalize(book.title) === trimmed)
  if (exact) {
    return exact
  }

  const partial = books.find((book) => normalize(book.title).includes(trimmed))
  if (partial) {
    return partial
  }

  const normalizedTokens = tokenize(trimmed)
  if (normalizedTokens.length === 0) {
    return null
  }

  const ranked = books
    .map((book) => {
      const titleTokens = new Set(tokenize(book.title))
      const overlap = normalizedTokens.reduce((count, token) => (titleTokens.has(token) ? count + 1 : count), 0)
      return { book, overlap }
    })
    .sort((left, right) => right.overlap - left.overlap)

  if ((ranked[0]?.overlap ?? 0) === 0) {
    return null
  }
  return ranked[0].book
}

export function recommendBooksFromFavorite(
  favorite: Book,
  books: Book[],
  limit = 12,
): RecommendationResult[] {
  return books
    .filter((book) => book.id !== favorite.id)
    .map((book) => ({
      book,
      score: scoreCandidate(favorite, book),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}
