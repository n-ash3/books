import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { BookGrid } from '../components/BookGrid'
import { fetchBooksByGenres } from '../lib/genreBrowse'
import type { Book, ShelfStatus } from '../lib/types'

interface MultiGenreBooksPageProps {
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

export function MultiGenreBooksPage({
  shelves,
  onShelfChange,
  onShelfRemove,
}: MultiGenreBooksPageProps) {
  const params = useParams<{ selected: string }>()
  const raw = params.selected ? decodeURIComponent(params.selected) : ''
  const selectedGenres = useMemo(
    () => raw.split(',').map((item) => item.trim()).filter(Boolean),
    [raw],
  )

  const contentKey = selectedGenres.join('::') || 'none'

  return (
    <MultiGenreBooksContent
      key={contentKey}
      selectedGenres={selectedGenres}
      shelves={shelves}
      onShelfChange={onShelfChange}
      onShelfRemove={onShelfRemove}
    />
  )
}

interface MultiGenreBooksContentProps extends MultiGenreBooksPageProps {
  selectedGenres: string[]
}

function MultiGenreBooksContent({
  selectedGenres,
  shelves,
  onShelfChange,
  onShelfRemove,
}: MultiGenreBooksContentProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void (async () => {
      const result = await fetchBooksByGenres(selectedGenres, 18)
      if (!active) {
        return
      }
      setBooks(result.slice(0, 48))
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [selectedGenres])

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel browse-panel--genre">
          <p className="genre-breadcrumb">
            <Link to="/browse/genres">Genres</Link>
          </p>
          <h1>Multi-genre Browse</h1>
          <p className="browse-subtitle">
            {selectedGenres.length > 0
              ? `Showing books across: ${selectedGenres.join(', ')}`
              : 'No genres selected.'}
          </p>

          {loading ? (
            <div className="genre-book-list">
              {Array.from({ length: 8 }, (_, index) => (
                <article key={`genre-book-skeleton-${index}`} className="genre-book-row skeleton-card">
                  <div className="genre-book-cover skeleton-block" />
                  <div className="genre-book-meta">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-author" />
                    <div className="skeleton-line skeleton-rating" />
                  </div>
                </article>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="genre-book-list">
              <BookGrid
                books={books}
                shelves={shelves}
                onShelfChange={onShelfChange}
                onShelfRemove={onShelfRemove}
                detailsPathForBook={(book) =>
                  `/book/${encodeURIComponent(book.id)}?fromGenre=${encodeURIComponent(selectedGenres.join(','))}`
                }
              />
            </div>
          ) : (
            <p className="source-note">No books found for those selected genres.</p>
          )}
        </section>
      </main>
    </div>
  )
}
