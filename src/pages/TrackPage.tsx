import { HardcoverHeader } from '../components/HardcoverHeader'
import { BookGrid } from '../components/BookGrid'
import { getShelfValue } from '../lib/shelves'
import type { Book, ShelfStatus } from '../lib/types'

interface TrackPageProps {
  books: Book[]
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

function ShelfSection({
  title,
  books,
  shelves,
  onShelfChange,
  onShelfRemove,
}: {
  title: string
  books: Book[]
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}) {
  return (
    <section className="panel discover-panel">
      <div className="section-title">
        <h2>{title}</h2>
      </div>
      {books.length > 0 ? (
        <BookGrid
          books={books}
          shelves={shelves}
          onShelfChange={onShelfChange}
          onShelfRemove={onShelfRemove}
        />
      ) : (
        <p className="source-note">No books in this shelf yet.</p>
      )}
    </section>
  )
}

export function TrackPage({ books, shelves, onShelfChange, onShelfRemove }: TrackPageProps) {
  const tbr = books.filter((book) => getShelfValue(book, shelves) === 'want_to_read')
  const reading = books.filter((book) => getShelfValue(book, shelves) === 'currently_reading')
  const read = books.filter((book) => getShelfValue(book, shelves) === 'read')
  const dnf = books.filter((book) => getShelfValue(book, shelves) === 'did_not_finish')

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Track</h1>
          <p className="browse-subtitle">
            Your reading shelves in one place: TBR, currently reading, read, and did not finish.
          </p>
        </section>

        <ShelfSection
          title="Want to Read (TBR)"
          books={tbr}
          shelves={shelves}
          onShelfChange={onShelfChange}
          onShelfRemove={onShelfRemove}
        />
        <ShelfSection
          title="Currently Reading"
          books={reading}
          shelves={shelves}
          onShelfChange={onShelfChange}
          onShelfRemove={onShelfRemove}
        />
        <ShelfSection
          title="Read"
          books={read}
          shelves={shelves}
          onShelfChange={onShelfChange}
          onShelfRemove={onShelfRemove}
        />
        <ShelfSection
          title="Did Not Finish"
          books={dnf}
          shelves={shelves}
          onShelfChange={onShelfChange}
          onShelfRemove={onShelfRemove}
        />
      </main>
    </div>
  )
}
