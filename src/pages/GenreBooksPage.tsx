import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { BookGrid } from '../components/BookGrid'
import { fetchBooksByGenre } from '../lib/genreBrowse'
import type { Book, ShelfStatus } from '../lib/types'

interface GenreBooksPageProps {
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

interface GenreBooksContentProps extends GenreBooksPageProps {
  genreName: string
  genreSlug: string
}

function titleCase(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function GenreBooksPage({ shelves, onShelfChange, onShelfRemove }: GenreBooksPageProps) {
  const params = useParams<{ genre: string }>()
  const genreSlug = params.genre ?? 'fantasy'
  const genreName = titleCase(genreSlug)

  return (
    <GenreBooksContent
      key={genreSlug}
      genreSlug={genreSlug}
      genreName={genreName}
      shelves={shelves}
      onShelfChange={onShelfChange}
      onShelfRemove={onShelfRemove}
    />
  )
}

function GenreBooksContent({
  genreName,
  genreSlug,
  shelves,
  onShelfChange,
  onShelfRemove,
}: GenreBooksContentProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void (async () => {
      const result = await fetchBooksByGenre(genreName, 40)
      if (!active) {
        return
      }
      setBooks(result)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [genreName])

  const list = useMemo(() => books.slice(0, 36), [books])

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel browse-panel--genre">
          <p className="genre-breadcrumb">
            <Link to="/browse/genres">Genres</Link>
          </p>
          <h1>{genreName}</h1>

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
          ) : (
            <div className="genre-book-list">
              <BookGrid
                books={list}
                shelves={shelves}
                onShelfChange={onShelfChange}
                onShelfRemove={onShelfRemove}
                detailsPathForBook={(book) =>
                  `/book/${encodeURIComponent(book.id)}?fromGenre=${encodeURIComponent(genreSlug)}`
                }
              />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
