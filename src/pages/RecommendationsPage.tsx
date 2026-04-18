import { useMemo, useState } from 'react'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { BookGrid } from '../components/BookGrid'
import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import { findFavoriteBook, recommendBooksFromFavorite } from '../lib/recommendationModel'
import type { Book, ShelfStatus } from '../lib/types'

interface RecommendationsPageProps {
  books: Book[]
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

export function RecommendationsPage({
  books,
  shelves,
  onShelfChange,
  onShelfRemove,
}: RecommendationsPageProps) {
  const [favoriteInput, setFavoriteInput] = useState('')
  const [submittedFavorite, setSubmittedFavorite] = useState('')

  const candidateBooks = books.length > 0 ? books : FALLBACK_BOOKS

  const favoriteBook = useMemo(
    () => findFavoriteBook(submittedFavorite, candidateBooks),
    [candidateBooks, submittedFavorite],
  )

  const recommendations = useMemo(() => {
    if (!favoriteBook) {
      return []
    }
    return recommendBooksFromFavorite(favoriteBook, candidateBooks, 16).map((entry) => entry.book)
  }, [candidateBooks, favoriteBook])

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>AI Book Recommendations</h1>
          <p className="browse-subtitle">
            Enter your favorite book and get model-ranked recommendations by genre, language
            similarity, popularity, and ratings.
          </p>
        </section>

        <section className="panel search-panel">
          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmittedFavorite(favoriteInput)
            }}
          >
            <input
              type="search"
              value={favoriteInput}
              onChange={(event) => setFavoriteInput(event.target.value)}
              placeholder="Type your favorite book title..."
              aria-label="Favorite book"
            />
            <button type="submit">Get Recommendations</button>
          </form>

          <p className="source-note">
            Example: <strong>The Hunger Games</strong>, <strong>The Hobbit</strong>,{' '}
            <strong>Atomic Habits</strong>
          </p>

          {submittedFavorite && !favoriteBook ? (
            <p className="inline-alert">
              Could not find “{submittedFavorite}” in the current catalog. Try another title.
            </p>
          ) : null}
          {favoriteBook ? (
            <p className="source-note">
              Matched favorite: <strong>{favoriteBook.title}</strong> by {favoriteBook.author}
            </p>
          ) : null}
        </section>

        <section className="panel discover-panel">
          <div className="section-title">
            <h2>Recommended Books</h2>
            <p>
              {favoriteBook
                ? `Top picks similar to ${favoriteBook.title}.`
                : 'Submit a favorite book to generate recommendations.'}
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
            <p className="source-note">No recommendations yet.</p>
          )}
        </section>
      </main>
    </div>
  )
}
