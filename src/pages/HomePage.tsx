import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookGrid } from '../components/BookGrid'
import { SearchBar } from '../components/SearchBar'
import { SearchState } from '../components/SearchState'
import { SourceBadge } from '../components/SourceBadge'
import { HardcoverHeader } from '../components/HardcoverHeader'
import type { Book, SearchResult, ShelfStatus } from '../lib/types'

interface HomePageProps {
  books: Book[]
  query: string
  source: SearchResult['source']
  loading: boolean
  error: string
  hasSearched: boolean
  shelves: Record<string, ShelfStatus>
  shelfSyncEnabled: boolean
  onSearchDebounced: (value: string) => void
  onSearchSubmit: (value: string) => void
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

export function HomePage({
  books,
  query,
  source,
  loading,
  error,
  hasSearched,
  shelves,
  shelfSyncEnabled,
  onSearchDebounced,
  onSearchSubmit,
  onShelfChange,
  onShelfRemove,
}: HomePageProps) {
  const hasQuery = query.trim().length > 0
  const showResults = !loading && books.length > 0

  const featureBlocks = useMemo(
    () => [
      {
        title: 'Find',
        content: 'Search across Hardcover, Google Books, and Open Library in one place.',
      },
      {
        title: 'Track',
        content: 'Use shelf states like Want to Read, Reading, Read, and DNF.',
      },
      {
        title: 'Connect',
        content: 'Structured like modern social book platforms with room to grow.',
      },
      {
        title: 'Discover',
        content: 'Fast, grid-friendly browsing with click-through detail pages.',
      },
    ],
    [],
  )

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Browse</h1>
          <p className="browse-subtitle">
            Choose a section. Genre browsing now has clickable categories and scrollable book lists.
          </p>
          <div className="feature-panel browse-tiles">
            {featureBlocks.map((feature) => {
              const to = feature.title === 'Find' ? '/' : '/browse/genres'
              return (
                <Link key={feature.title} className="browse-tile-link" to={to}>
                  <article>
                    <h2>{feature.title}</h2>
                    <p>{feature.content}</p>
                  </article>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="panel search-panel">
          <SearchBar
            value={query}
            onDebouncedChange={onSearchDebounced}
            onSubmit={onSearchSubmit}
            loading={loading}
          />
          <SourceBadge source={source} />
          <p className="source-note">
            Shelf sync:{' '}
            <strong>{shelfSyncEnabled ? 'Connected to backend' : 'Local-only (set Django sync URL)'}</strong>
          </p>
          <p className="source-note">
            Want genre browsing? <Link to="/browse/genres">Open Genres</Link>
          </p>
          {error ? <p className="inline-alert">{error}</p> : null}
        </section>

        <section className="panel discover-panel">
          <div className="section-title">
            <h2>Discover</h2>
            <p>Compact cards. Click any card for details.</p>
          </div>
          <SearchState
            loading={loading}
            hasQuery={hasQuery || hasSearched}
            hasResults={books.length > 0}
          />
          {showResults ? (
            <BookGrid
              books={books}
              shelves={shelves}
              onShelfChange={onShelfChange}
              onShelfRemove={onShelfRemove}
            />
          ) : null}
        </section>
      </main>
    </div>
  )
}
