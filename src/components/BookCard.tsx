import { Link } from 'react-router-dom'
import { ShelfSelector } from './ShelfSelector'
import type { Book, ShelfStatus, ShelfValue } from '../lib/types'

interface BookCardProps {
  book: Book
  shelfValue: ShelfStatus
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

export function BookCard({ book, shelfValue, onShelfChange, onShelfRemove }: BookCardProps) {
  const cardShelfValue: ShelfValue = shelfValue

  return (
    <article className="book-card" key={book.id}>
      <Link className="book-link" to={`/book/${encodeURIComponent(book.id)}`}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={`${book.title} cover`} className="book-cover" />
        ) : (
          <div className="book-cover book-cover--placeholder" aria-hidden="true">
            No cover
          </div>
        )}
      </Link>
      <div className="book-meta">
        <h3>
          <Link className="book-link" to={`/book/${encodeURIComponent(book.id)}`}>
            {book.title}
          </Link>
        </h3>
        <p className="author">{book.author}</p>
        <p className="rating-row">
          {book.rating ? `${book.rating.toFixed(1)} ★` : 'No rating'}
          {book.ratingCount ? ` (${book.ratingCount.toLocaleString()})` : ''}
        </p>
      </div>
      <ShelfSelector
        className="shelf-select card-shelf-select"
        value={cardShelfValue}
        onChange={(status) => {
          if (status === 'none') {
            void onShelfRemove(book)
            return
          }
          onShelfChange(book, status)
        }}
        label="Add to shelf"
        allowRemove
      />
      <div className="card-actions">
        <button
          type="button"
          className="remove-shelf-btn"
          onClick={() => {
            void onShelfRemove(book)
          }}
        >
          Remove
        </button>
        <Link className="details-cta" to={`/book/${encodeURIComponent(book.id)}`}>
          Open details
        </Link>
      </div>
    </article>
  )
}
