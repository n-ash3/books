import { HardcoverHeader } from '../components/HardcoverHeader'
import { BookGrid } from '../components/BookGrid'
import { getShelfValue } from '../lib/shelves'
import type { Book, ShelfStatus } from '../lib/types'

interface DiscoverPageProps {
  books: Book[]
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

function scoreBySimilarity(candidate: Book, readGenres: Set<string>, readAuthors: Set<string>): number {
  let score = 0
  if (readAuthors.has(candidate.author.toLowerCase())) {
    score += 4
  }
  candidate.genres.forEach((genre) => {
    if (readGenres.has(genre.toLowerCase())) {
      score += 2
    }
  })
  if (candidate.rating) {
    score += candidate.rating / 2
  }
  return score
}

export function DiscoverPage({ books, shelves, onShelfChange, onShelfRemove }: DiscoverPageProps) {
  const readBooks = books.filter((book) => getShelfValue(book, shelves) === 'read')
  const readIds = new Set(readBooks.map((book) => book.id))

  const readGenres = new Set(
    readBooks.flatMap((book) => book.genres.map((genre) => genre.toLowerCase())).filter(Boolean),
  )
  const readAuthors = new Set(readBooks.map((book) => book.author.toLowerCase()))

  const recommendations = books
    .filter((book) => !readIds.has(book.id))
    .map((book) => ({
      book,
      score: scoreBySimilarity(book, readGenres, readAuthors),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map((entry) => entry.book)

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Discover</h1>
          <p className="browse-subtitle">
            Recommendations similar to books you marked as read (author + genre based).
          </p>
        </section>

        <section className="panel discover-panel">
          <div className="section-title">
            <h2>Suggested for you</h2>
            <p>
              {readBooks.length > 0
                ? `Based on ${readBooks.length} books in your Read shelf.`
                : 'Mark books as Read in Track to improve recommendations.'}
            </p>
          </div>
          {recommendations.length > 0 ? (
            <BookGrid
              books={recommendations}
              shelves={shelves}
              onShelfChange={onShelfChange}
              onShelfRemove={onShelfRemove}
            />
          ) : (
            <p className="source-note">No recommendations yet. Add a few books to your Read shelf first.</p>
          )}
        </section>
      </main>
    </div>
  )
}
