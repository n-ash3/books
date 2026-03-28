import { BookGrid } from '../components/BookGrid'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { SearchBar } from '../components/SearchBar'
import { SearchState } from '../components/SearchState'
import { SourceBadge } from '../components/SourceBadge'
import type { Book, SearchResult, ShelfStatus } from '../lib/types'

interface FindPageProps {
  books: Book[]
  query: string
  source: SearchResult['source']
  loading: boolean
  error: string
  hasSearched: boolean
  shelves: Record<string, ShelfStatus>
  onSearchDebounced: (value: string) => void
  onSearchSubmit: (value: string) => void
  onShelfChange: (book: Book, status: ShelfStatus) => void
  onShelfRemove: (book: Book) => Promise<void> | void
}

export function FindPage({
  books,
  query,
  source,
  loading,
  error,
  hasSearched,
  shelves,
  onSearchDebounced,
  onSearchSubmit,
  onShelfChange,
  onShelfRemove,
}: FindPageProps) {
  const hasQuery = query.trim().length > 0
  const showResults = !loading && books.length > 0

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Find</h1>
          <p className="browse-subtitle">Search through a large catalog and open any book for full details.</p>
        </section>

        <section className="panel search-panel">
          <SearchBar
            value={query}
            onDebouncedChange={onSearchDebounced}
            onSubmit={onSearchSubmit}
            loading={loading}
          />
          <SourceBadge source={source} />
          {error ? <p className="inline-alert">{error}</p> : null}
        </section>

        <section className="panel discover-panel">
          <div className="section-title">
            <h2>Results</h2>
            <p>Compact cards for quick scanning.</p>
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
