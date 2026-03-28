import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { Book, ShelfStatus, ShelfValue } from '../lib/types'
import { buildRetailerLinks } from '../lib/retailerLinks'
import { formatShelfLabel, getBookIdentifier } from '../lib/shelves'
import { ShelfSelector } from '../components/ShelfSelector'
import { CoverImage } from '../components/CoverImage'

interface BookDetailPageProps {
  booksById: Record<string, Book>
  shelves: Record<string, ShelfStatus>
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

type DetailTab = 'book_info' | 'reviews' | 'editions' | 'lists' | 'activity'

const FOURTH_WING_ISBN13 = '9781649374042'

export function BookDetailPage({
  booksById,
  shelves,
  onShelfChange,
  onShelfRemove,
}: BookDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('book_info')
  const fourthWingDemoData = useMemo(
    () => ({
      reviews: [
        {
          reviewer: 'Demo Reader A',
          rating: 5,
          quote: 'Dragon school tension plus romance made this impossible to put down.',
        },
        {
          reviewer: 'Demo Reader B',
          rating: 4,
          quote: 'Fast pacing, memorable supporting cast, and strong emotional beats.',
        },
      ],
      editions: [
        { label: 'Hardcover', year: '2023', isbn: '9781649374042' },
        { label: 'Paperback', year: '2024', isbn: '9781649377371' },
      ],
      lists: [
        'Top Romantasy Starter Picks',
        'Most Popular Dragon Rider Books',
        'BookBoard Community Favorites',
      ],
      activity: [
        'Added to Read shelf by this demo account',
        'Marked as 5-star candidate during walkthrough',
        'Opened from Find multi-genre filter',
      ],
    }),
    [],
  )

  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const decodedId = params.id ? decodeURIComponent(params.id) : ''
  const book = booksById[decodedId]
  const fromGenre = searchParams.get('fromGenre')
  const isMultiGenre = fromGenre?.includes(',')
  const backPath = fromGenre
    ? isMultiGenre
      ? `/browse/genres/multi/${encodeURIComponent(fromGenre)}`
      : `/browse/genres/${encodeURIComponent(fromGenre)}`
    : '/'

  if (!book) {
    return (
      <div className="app-shell">
        <section className="panel detail-not-found">
          <h1>Book not found</h1>
          <p>
            This book is not in your current cache yet. Go back and run a search,
            then open the title from the results.
          </p>
          <Link to={backPath} className="details-cta">
            Back
          </Link>
        </section>
      </div>
    )
  }

  const retailerLinks = buildRetailerLinks(book)
  const isFourthWing = book.isbn13 === FOURTH_WING_ISBN13 || book.title.toLowerCase() === 'fourth wing'
  const shelf: ShelfStatus =
    isFourthWing
      ? 'read'
      : (shelves[getBookIdentifier(book)] ?? 'want_to_read')
  const detailShelfValue: ShelfValue = shelf

  return (
    <div className="detail-root">
      <div className="detail-banner" />
      <div className="app-shell detail-shell">
        <section className="panel detail-card">
          <nav className="detail-nav">
            <Link to={backPath}>Back to Browse</Link>
            <a href="https://hardcover.app/" target="_blank" rel="noreferrer">
              Hardcover
            </a>
          </nav>

          <div className="detail-top">
            <div className="detail-cover-wrap">
              <CoverImage
                book={book}
                alt={`${book.title} cover`}
                className="detail-cover"
                placeholderClassName="detail-cover detail-cover--placeholder"
              />
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

              <ShelfSelector
                className="shelf-select detail-shelf"
                label="Shelf"
                value={detailShelfValue}
                allowRemove
                onChange={(status) => {
                  if (status === 'none') {
                    void onShelfRemove(book)
                    return
                  }
                  onShelfChange(book, status)
                }}
              />
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
            <button
              type="button"
              className={activeTab === 'book_info' ? 'active' : ''}
              onClick={() => setActiveTab('book_info')}
            >
              Book Info
            </button>
            <button
              type="button"
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button
              type="button"
              className={activeTab === 'editions' ? 'active' : ''}
              onClick={() => setActiveTab('editions')}
            >
              Editions
            </button>
            <button
              type="button"
              className={activeTab === 'lists' ? 'active' : ''}
              onClick={() => setActiveTab('lists')}
            >
              Lists
            </button>
            <button
              type="button"
              className={activeTab === 'activity' ? 'active' : ''}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>

          {activeTab === 'book_info' ? (
            <>
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
                  <h3>Metadata</h3>
                  <p>Publisher: {book.publisher ?? 'Unknown'}</p>
                  <p>Ratings: {book.ratingCount ? book.ratingCount.toLocaleString() : 'Unknown'}</p>
                  <p>ISBN-13: {book.isbn13 ?? 'Unknown'}</p>
                  <p>ISBN-10: {book.isbn10 ?? 'Unknown'}</p>
                </div>
              </section>

              {book.reviewPreview ? (
                <section className="detail-review-preview">
                  <h3>Review preview</h3>
                  <p>{book.reviewPreview}</p>
                </section>
              ) : null}
            </>
          ) : null}

          {activeTab === 'reviews' ? (
            <section className="detail-review-preview">
              <h3>Reviews</h3>
              {isFourthWing ? (
                <ul className="detail-list">
                  {fourthWingDemoData.reviews.map((review) => (
                    <li key={review.reviewer}>
                      <strong>
                        {review.reviewer} · {review.rating.toFixed(1)} ★
                      </strong>
                      <p>{review.quote}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Demo review content is available only for Fourth Wing.</p>
              )}
            </section>
          ) : null}

          {activeTab === 'editions' ? (
            <section className="detail-review-preview">
              <h3>Editions</h3>
              {isFourthWing ? (
                <ul className="detail-list">
                  {fourthWingDemoData.editions.map((edition) => (
                    <li key={`${edition.label}-${edition.isbn}`}>
                      <strong>{edition.label}</strong>
                      <p>
                        Year: {edition.year} · ISBN: {edition.isbn}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Demo edition content is available only for Fourth Wing.</p>
              )}
            </section>
          ) : null}

          {activeTab === 'lists' ? (
            <section className="detail-review-preview">
              <h3>Lists</h3>
              {isFourthWing ? (
                <ul className="detail-list">
                  {fourthWingDemoData.lists.map((listName) => (
                    <li key={listName}>{listName}</li>
                  ))}
                </ul>
              ) : (
                <p>Demo list content is available only for Fourth Wing.</p>
              )}
            </section>
          ) : null}

          {activeTab === 'activity' ? (
            <section className="detail-review-preview">
              <h3>Activity</h3>
              {isFourthWing ? (
                <ul className="detail-list">
                  {fourthWingDemoData.activity.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              ) : (
                <p>Demo activity content is available only for Fourth Wing.</p>
              )}
            </section>
          ) : null}
        </section>
      </div>
    </div>
  )
}
