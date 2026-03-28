import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ShelfSelector } from './ShelfSelector'
import { resolveCoverCandidates } from '../lib/coverFallback'
import type { Book, ShelfStatus, ShelfValue } from '../lib/types'

interface BookCardProps {
  book: Book
  shelfValue: ShelfStatus
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
  detailsPath?: string
}

export function BookCard({
  book,
  shelfValue,
  onShelfChange,
  onShelfRemove,
  detailsPath,
}: BookCardProps) {
  const [coverIndex, setCoverIndex] = useState(0)
  const cardShelfValue: ShelfValue = shelfValue
  const destination = detailsPath ?? `/book/${encodeURIComponent(book.id)}`
  const coverCandidates = resolveCoverCandidates(book)
  const coverUrl = coverCandidates[coverIndex]

  return (
    <article className="book-card" key={book.id}>
      <Link className="book-link" to={destination}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${book.title} cover`}
            className="book-cover"
            onError={() => {
              if (coverIndex < coverCandidates.length - 1) {
                setCoverIndex((previous) => previous + 1)
              } else {
                setCoverIndex(coverCandidates.length)
              }
            }}
          />
        ) : (
          <div className="book-cover book-cover--placeholder" aria-hidden="true">
            No cover
          </div>
        )}
      </Link>
      <div className="book-meta">
        <h3>
          <Link className="book-link" to={destination}>
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
        <Link className="details-cta" to={destination}>
          Open details
        </Link>
      </div>
    </article>
  )
}
