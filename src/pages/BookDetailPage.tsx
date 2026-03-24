import { Link, useParams } from 'react-router-dom'
import type { Book, ShelfStatus } from '../lib/types'
import { buildRetailerLinks } from '../lib/retailerLinks'
import { formatShelfLabel, getBookIdentifier, SHELF_OPTIONS } from '../lib/shelves'

interface BookDetailPageProps {
  booksById: Record<string, Book>
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
}

export function BookDetailPage({ booksById, shelves, onShelfChange }: BookDetailPageProps) {
  const params = useParams<{ id: string }>()
  const decodedId = params.id ? decodeURIComponent(params.id) : ''
  const book = booksById[decodedId]

  if (!book) {
    return (
      <div className="app-shell">
        <section className="panel detail-not-found">
          <h1>Book not found</h1>
          <p>
            This book is not in your current cache yet. Go back and run a search,
            then open the title from the results.
          </p>
          <Link to="/" className="details-cta">
            Back to search
          </Link>
        </section>
      </div>
    )
  }

  const retailerLinks = buildRetailerLinks(book)
  const shelf = shelves[getBookIdentifier(book)] ?? 'want_to_read'

  return (
    <div className="detail-root">
      <div className="detail-banner" />
      <div className="app-shell detail-shell">
        <section className="panel detail-card">
          <nav className="detail-nav">
            <Link to="/">Back to Discover</Link>
            <a href="https://hardcover.app/" target="_blank" rel="noreferrer">
              Hardcover
            </a>
          </nav>

          <div className="detail-top">
            <div className="detail-cover-wrap">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={`${book.title} cover`} className="detail-cover" />
              ) : (
                <div className="detail-cover detail-cover--placeholder">No cover</div>
              )}
            </div>

            <div className="detail-main">
              <p className="detail-kicker">{book.source.toUpperCase()} SOURCE</p>
              <h1>{book.title}</h1>
              <p className="detail-author">By {book.author}</p>

              <div className="detail-stats">
                <div>
                  <span>Published</span>
                  <strong>{book.releaseDate || 'Unknown'}</strong>
                </div>
                <div>
                  <span>Pages</span>
                  <strong>{book.pages ? String(book.pages) : 'Unknown'}</strong>
                </div>
                <div>
                  <span>Average rating</span>
                  <strong>{book.rating ? `${book.rating.toFixed(1)} ★` : 'Not available'}</strong>
                </div>
              </div>

              <label className="shelf-select detail-shelf">
                Shelf
                <select
                  value={shelf}
                  onChange={(event) => onShelfChange(book, event.target.value as ShelfStatus)}
                >
                  {SHELF_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="shelf-preview">Current shelf: {formatShelfLabel(shelf)}</p>

              <div className="retailer-links detail-links">
                {retailerLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noreferrer">
                    Buy on {link.name}
                  </a>
                ))}
                {book.canonicalUrl ? (
                  <a href={book.canonicalUrl} target="_blank" rel="noreferrer">
                    View canonical listing
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="detail-tabs">
            <button type="button" className="active">
              Book Info
            </button>
            <button type="button">Reviews</button>
            <button type="button">Editions</button>
            <button type="button">Lists</button>
            <button type="button">Activity</button>
          </div>

          <article className="detail-description">
            <h2>Book Info</h2>
            <p>{book.description || 'No description available yet for this title.'}</p>
          </article>

          <section className="detail-meta-grid">
            <div>
              <h3>Genres</h3>
              <div className="pill-row">
                {(book.genres?.length ? book.genres : ['General']).map((genre) => (
                  <span key={genre} className="pill">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3>Identifiers</h3>
              <p>ISBN-13: {book.isbn13 ?? 'Unknown'}</p>
              <p>ISBN-10: {book.isbn10 ?? 'Unknown'}</p>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
