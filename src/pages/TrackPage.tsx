import { useMemo, useState } from 'react'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { BookGrid } from '../components/BookGrid'
import { ShelfTabs } from '../components/ShelfTabs'
import { getShelfValue } from '../lib/shelves'
import type { Book, ShelfStatus } from '../lib/types'

interface TrackPageProps {
  books: Book[]
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

export function TrackPage({ books, shelves, onShelfChange, onShelfRemove }: TrackPageProps) {
  const [activeShelf, setActiveShelf] = useState<ShelfStatus>('want_to_read')

  const grouped = useMemo(() => {
    const base: Record<ShelfStatus, Book[]> = {
      want_to_read: [],
      currently_reading: [],
      read: [],
      did_not_finish: [],
    }

    books.forEach((book) => {
      const shelf = getShelfValue(book, shelves)
      base[shelf].push(book)
    })

    return base
  }, [books, shelves])

  const counts = useMemo(
    () => ({
      want_to_read: grouped.want_to_read.length,
      currently_reading: grouped.currently_reading.length,
      read: grouped.read.length,
      did_not_finish: grouped.did_not_finish.length,
    }),
    [grouped],
  )

  const visibleBooks = grouped[activeShelf]

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Track</h1>
          <p className="browse-subtitle">
            Your reading shelves in one place: TBR, currently reading, read, and did not finish.
          </p>
          <p className="source-note">
            Default shelf is <strong>Want to Read (TBR)</strong>. Use the options below to switch views.
          </p>
        </section>

        <section className="panel discover-panel">
          <ShelfTabs active={activeShelf} counts={counts} onChange={setActiveShelf} />
          {visibleBooks.length > 0 ? (
            <BookGrid
              books={visibleBooks}
              shelves={shelves}
              onShelfChange={onShelfChange}
              onShelfRemove={onShelfRemove}
            />
          ) : (
            <p className="source-note">No books in this shelf yet.</p>
          )}
        </section>
      </main>
    </div>
  )
}
