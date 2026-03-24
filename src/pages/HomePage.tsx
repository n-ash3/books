import { useMemo } from 'react'
import { BookGrid } from '../components/BookGrid'
import { SearchBar } from '../components/SearchBar'
import { SearchState } from '../components/SearchState'
import { SourceBadge } from '../components/SourceBadge'
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
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Book Smart</p>
        <h1>Track books with a modern, Hardcover-style reading workflow.</h1>
        <p className="hero-copy">
          Compact cards for browsing. Rich detail pages for deep info. Multi-provider search for
          broader book coverage.
        </p>
      </header>

      <section className="panel feature-panel">
        {featureBlocks.map((feature) => (
          <article key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.content}</p>
          </article>
        ))}
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
        {error ? <p className="inline-alert">{error}</p> : null}
      </section>

      <section className="panel discover-panel">
        <div className="section-title">
          <h2>Discover</h2>
          <p>Cards are intentionally compact. Open any card for full book details.</p>
        </div>
        <SearchState loading={loading} hasQuery={hasQuery || hasSearched} hasResults={books.length > 0} />
        {showResults ? (
          <BookGrid
            books={books}
            shelves={shelves}
            onShelfChange={onShelfChange}
            onShelfRemove={onShelfRemove}
          />
        ) : null}
      </section>
    </div>
  )
}
