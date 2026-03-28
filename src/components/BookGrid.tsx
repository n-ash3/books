import { BookCard } from './BookCard'
import { getShelfValue } from '../lib/shelves'
import type { Book, ShelfStatus } from '../lib/types'

interface BookGridProps {
  books: Book[]
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => void
  detailsPathForBook?: (book: Book) => string
}

export function BookGrid({
  books,
  shelves,
  onShelfChange,
  onShelfRemove,
  detailsPathForBook,
}: BookGridProps) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          shelfValue={getShelfValue(book, shelves)}
          onShelfChange={onShelfChange}
          onShelfRemove={onShelfRemove}
          detailsPath={detailsPathForBook?.(book)}
        />
      ))}
    </div>
  )
}
