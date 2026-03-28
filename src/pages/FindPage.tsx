import { useEffect, useMemo, useState } from 'react'
import { BookGrid } from '../components/BookGrid'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { SearchBar } from '../components/SearchBar'
import { SearchState } from '../components/SearchState'
import { SourceBadge } from '../components/SourceBadge'
import { fetchBooksByGenre, fetchGenres } from '../lib/genreBrowse'
import type { Book, SearchResult, ShelfStatus } from '../lib/types'

interface FindPageProps {
  books: Book[]
  allBooks: Book[]
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
  allBooks,
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
  const [activeGenre, setActiveGenre] = useState('all')
  const [sortMode, setSortMode] = useState<'popular' | 'topRated' | 'newest'>('popular')
  const [webGenres, setWebGenres] = useState<string[]>([])
  const [webGenreBooks, setWebGenreBooks] = useState<Book[]>([])
  const [loadedGenre, setLoadedGenre] = useState('')

  const hasQuery = query.trim().length > 0

  useEffect(() => {
    let active = true
    void (async () => {
      const result = await fetchGenres(20)
      if (!active) {
        return
      }
      setWebGenres(result.map((genre) => genre.name))
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (hasQuery || activeGenre === 'all') {
      return
    }
    let active = true
    void (async () => {
      const result = await fetchBooksByGenre(activeGenre, 60)
      if (!active) {
        return
      }
      setWebGenreBooks(result)
      setLoadedGenre(activeGenre)
    })()

    return () => {
      active = false
    }
  }, [activeGenre, hasQuery])

  const genreFeedPending = !hasQuery && activeGenre !== 'all' && loadedGenre !== activeGenre
  const candidateBooks = useMemo(() => {
    if (hasQuery) {
      return books
    }
    if (activeGenre !== 'all') {
      return genreFeedPending ? [] : webGenreBooks
    }
    return allBooks
  }, [activeGenre, allBooks, books, genreFeedPending, hasQuery, webGenreBooks])

  const genreOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        [...webGenres, ...allBooks.flatMap((book) => book.genres), ...books.flatMap((book) => book.genres)]
          .map((genre) => genre.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b))
    return unique
  }, [allBooks, books, webGenres])

  const filteredBooks = useMemo(() => {
    const scoped =
      activeGenre === 'all' || (!hasQuery && activeGenre !== 'all')
        ? candidateBooks
        : candidateBooks.filter((book) =>
            book.genres.some((genre) => genre.toLowerCase() === activeGenre.toLowerCase()),
          )

    const sorted = [...scoped]
    if (sortMode === 'popular') {
      sorted.sort((a, b) => {
        const byCount = (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
        if (byCount !== 0) {
          return byCount
        }
        return (b.rating ?? 0) - (a.rating ?? 0)
      })
    } else if (sortMode === 'topRated') {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    } else {
      sorted.sort((a, b) => Number(b.releaseDate || 0) - Number(a.releaseDate || 0))
    }
    return sorted
  }, [activeGenre, candidateBooks, hasQuery, sortMode])

  const effectiveLoading = loading || genreFeedPending
  const showResults = !effectiveLoading && filteredBooks.length > 0
  const popularMode = sortMode === 'popular'

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Find</h1>
          <p className="browse-subtitle">
            Search through a large catalog and filter by genre to see what is most popular.
          </p>
        </section>

        <section className="panel search-panel">
          <SearchBar
            value={query}
            onDebouncedChange={onSearchDebounced}
            onSubmit={onSearchSubmit}
            loading={loading}
          />
          <div className="find-filters">
            <label className="shelf-select">
              Genre
              <select value={activeGenre} onChange={(event) => setActiveGenre(event.target.value)}>
                <option value="all">All genres</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>

            <label className="shelf-select">
              Sort by
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as 'popular' | 'topRated' | 'newest')}
              >
                <option value="popular">Most popular</option>
                <option value="topRated">Top rated</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
          <SourceBadge source={source} />
          {popularMode ? (
            <p className="source-note">
              Showing <strong>most popular</strong> titles (ranked by rating count, then rating).
            </p>
          ) : null}
          {error ? <p className="inline-alert">{error}</p> : null}
        </section>

        <section className="panel discover-panel">
          <div className="section-title">
            <h2>Results</h2>
            <p>Compact cards for quick scanning.</p>
          </div>
          <SearchState
            loading={effectiveLoading}
            hasQuery={hasQuery || hasSearched}
            hasResults={filteredBooks.length > 0}
          />
          {showResults ? (
            <BookGrid
              books={filteredBooks}
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
