import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { searchBooks } from './lib/bookSearch'
import type { Book, SearchResult, ShelfStatus } from './lib/types'
import { FALLBACK_BOOKS } from './data/fallbackBooks'
import { buildRetailerLinks } from './lib/retailerLinks'
import {
  formatShelfLabel,
  getBookIdentifier,
  getShelfValue,
  loadShelves,
  persistShelves,
  SHELF_OPTIONS,
} from './lib/shelves'
import { loadBookCache, updateBookCacheWithResults } from './lib/bookStore'
import { BookDetailPage } from './pages/BookDetailPage'

function App() {
  const initialCache = useMemo(() => loadBookCache(), [])
  const [query, setQuery] = useState('the hobbit')
  const [books, setBooks] = useState<Book[]>(initialCache)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState<SearchResult['source']>('fallback')
  const [shelves, setShelves] = useState<Record<string, ShelfStatus>>({})
  const [bookCache, setBookCache] = useState<Book[]>(initialCache)

  useEffect(() => {
    setShelves(loadShelves())
  }, [])

  const booksById = useMemo(() => {
    return bookCache.reduce<Record<string, Book>>((acc, book) => {
      acc[book.id] = book
      return acc
    }, {})
  }, [bookCache])

  const shelfStats = useMemo(() => {
    const counts = {
      want_to_read: 0,
      currently_reading: 0,
      read: 0,
      did_not_finish: 0,
    }

    Object.values(shelves).forEach((status) => {
      counts[status] += 1
    })

    return counts
  }, [shelves])

  const trackedCount = useMemo(() => Object.keys(shelves).length, [shelves])

  async function runSearch(searchTerm: string): Promise<void> {
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      setBooks(FALLBACK_BOOKS)
      setSource('fallback')
      setError('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await searchBooks(trimmed)
      setBooks(result.books)
      setBookCache((previous) => updateBookCacheWithResults(previous, result.books))
      setSource(result.source)
      setError(result.error ?? '')
    } catch {
      setBooks(FALLBACK_BOOKS)
      setSource('fallback')
      setError('Search failed. Showing curated fallback titles.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void runSearch(query)
  }

  function updateShelf(book: Book, status: ShelfStatus): void {
    const key = getBookIdentifier(book)
    const next = { ...shelves, [key]: status }
    setShelves(next)
    persistShelves(next)
  }

  useEffect(() => {
    if (books.length > 0) {
      setBookCache((previous) => updateBookCacheWithResults(previous, books))
    }
  }, [books])

  const homePage = (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Book Smart</p>
        <h1>Track books, discover reads, and buy from your favorite stores.</h1>
        <p className="hero-copy">
          A Hardcover and Goodreads inspired reader platform with shelves, social
          discovery, and one-click purchase links to Amazon, Barnes & Noble,
          Target, and Books-A-Million.
        </p>
        <div className="hero-links">
          <a href="https://docs.hardcover.app/" target="_blank" rel="noreferrer">
            Hardcover API Docs
          </a>
          <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer">
            Connect on Discord
          </a>
        </div>
      </header>

      <section className="panel feature-panel">
        <article>
          <h2>Find</h2>
          <p>
            Search and browse books by title, author, ISBN, or series with
            Hardcover API support.
          </p>
        </article>
        <article>
          <h2>Track</h2>
          <p>
            Organize every title into Want to Read, Currently Reading, Read, and
            Did Not Finish shelves.
          </p>
        </article>
        <article>
          <h2>Connect</h2>
          <p>
            Build social reading momentum with profile ideas and public shelf
            activity inspired by Goodreads-style communities.
          </p>
        </article>
        <article>
          <h2>Discover</h2>
          <p>
            Use shelf trends, ratings, and recommendations to surface your next
            life-changing read.
          </p>
        </article>
      </section>

      <section className="panel search-panel">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search books, authors, ISBN, series..."
            aria-label="Search books"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Find Books'}
          </button>
        </form>
        <p className="source-note">
          Data source:{' '}
          <strong>
            {source === 'hardcover'
              ? 'Hardcover API'
              : source === 'openlibrary'
                ? 'Open Library'
                : source === 'mixed'
                  ? 'Hardcover + Open Library'
                  : 'Fallback seed data'}
          </strong>
        </p>
        {error ? <p className="inline-alert">{error}</p> : null}
      </section>

      <section className="panel stats-panel">
        <h2>Your Shelves</h2>
        <div className="stats-grid">
          <article>
            <h3>{trackedCount}</h3>
            <p>Total Tracked</p>
          </article>
          <article>
            <h3>{shelfStats.want_to_read}</h3>
            <p>Want to Read</p>
          </article>
          <article>
            <h3>{shelfStats.currently_reading}</h3>
            <p>Currently Reading</p>
          </article>
          <article>
            <h3>{shelfStats.read}</h3>
            <p>Read</p>
          </article>
          <article>
            <h3>{shelfStats.did_not_finish}</h3>
            <p>Did Not Finish</p>
          </article>
        </div>
      </section>

      <section className="panel discover-panel">
        <div className="section-title">
          <h2>Discover</h2>
          <p>Search results with community-style tracking and buy links.</p>
        </div>
        <div className="book-grid">
          {books.map((book) => {
            const retailerLinks = buildRetailerLinks(book)
            const shelfValue = getShelfValue(book, shelves)

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
                  <p className="description">{book.description}</p>
                </div>
                <div className="book-row">
                  <span>{book.releaseDate ? `Published ${book.releaseDate}` : 'Date unknown'}</span>
                  <span>{book.rating ? `${book.rating.toFixed(1)}★` : 'No rating yet'}</span>
                </div>
                <div className="book-row">
                  <span>{book.pages ? `${book.pages} pages` : 'Page count unknown'}</span>
                  <span>{book.genres?.length ? book.genres.slice(0, 2).join(', ') : 'No genres yet'}</span>
                </div>
                <label className="shelf-select">
                  Shelf
                  <select
                    value={shelfValue}
                    onChange={(event) => updateShelf(book, event.target.value as ShelfStatus)}
                  >
                    {SHELF_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="shelf-preview">Current shelf: {formatShelfLabel(shelfValue)}</p>
                <div className="retailer-links">
                  {retailerLinks.map((link) => (
                    <a key={link.name} href={link.url} target="_blank" rel="noreferrer">
                      {link.name}
                    </a>
                  ))}
                </div>
                <Link className="details-cta" to={`/book/${encodeURIComponent(book.id)}`}>
                  Open details
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel social-panel">
        <div>
          <h2>Connect</h2>
          <p>
            Follow other readers, explore their shelves, and surface your next
            favorite read with activity-based discovery.
          </p>
        </div>
        <ul>
          <li>Browse public libraries and reading streaks.</li>
          <li>Track reading goals and progress trends.</li>
          <li>Use AI-ready recommendation surfaces (future extension).</li>
        </ul>
      </section>

      <footer className="panel footer-panel">
        <p>
          Built for readers who want discovery + tracking + purchase links in one
          place.
        </p>
      </footer>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={homePage} />
      <Route
        path="/book/:id"
        element={
          <BookDetailPage
            booksById={booksById}
            shelves={shelves}
            onShelfChange={updateShelf}
          />
        }
      />
    </Routes>
  )
}

export default App
