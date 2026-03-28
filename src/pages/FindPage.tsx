import { useEffect, useMemo, useState } from 'react'
import { BookGrid } from '../components/BookGrid'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { SearchBar } from '../components/SearchBar'
import { SearchState } from '../components/SearchState'
import { SourceBadge } from '../components/SourceBadge'
import { fetchBooksByGenres, fetchGenres } from '../lib/genreBrowse'
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
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [genrePicker, setGenrePicker] = useState('')
  const [sortMode, setSortMode] = useState<'popular' | 'topRated' | 'newest'>('popular')
  const [webGenres, setWebGenres] = useState<string[]>([])
  const [webGenreBooks, setWebGenreBooks] = useState<Book[]>([])
  const [loadedGenreKey, setLoadedGenreKey] = useState('')

  const hasQuery = query.trim().length > 0
  const selectedGenreKey = useMemo(
    () => [...selectedGenres].sort((a, b) => a.localeCompare(b)).join('||'),
    [selectedGenres],
  )

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
    if (hasQuery || selectedGenres.length === 0) {
      return
    }
    let active = true
    void (async () => {
      const result = await fetchBooksByGenres(selectedGenres, 26)
      if (!active) {
        return
      }
      setWebGenreBooks(result)
      setLoadedGenreKey(selectedGenreKey)
    })()

    return () => {
      active = false
    }
  }, [hasQuery, selectedGenreKey, selectedGenres])

  const genreFeedPending =
    !hasQuery && selectedGenres.length > 0 && loadedGenreKey !== selectedGenreKey
  const candidateBooks = useMemo(() => {
    if (hasQuery) {
      return books
    }
    if (selectedGenres.length > 0) {
      return genreFeedPending ? [] : webGenreBooks
    }
    return allBooks
  }, [allBooks, books, genreFeedPending, hasQuery, selectedGenres.length, webGenreBooks])

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

  const availableGenres = useMemo(
    () => genreOptions.filter((genre) => !selectedGenres.includes(genre)),
    [genreOptions, selectedGenres],
  )

  function addGenreFilter(): void {
    const next = genrePicker.trim()
    if (!next) {
      return
    }
    setSelectedGenres((previous) => {
      if (previous.includes(next)) {
        return previous
      }
      return [...previous, next]
    })
    setGenrePicker('')
  }

  function removeGenreFilter(genre: string): void {
    setSelectedGenres((previous) => previous.filter((item) => item !== genre))
  }

  function clearGenreFilters(): void {
    setSelectedGenres([])
    setGenrePicker('')
  }

  const filteredBooks = useMemo(() => {
    const scoped =
      selectedGenres.length === 0 || !hasQuery
        ? candidateBooks
        : candidateBooks.filter((book) =>
            selectedGenres.some((selected) =>
              book.genres.some((genre) => genre.toLowerCase() === selected.toLowerCase()),
            ),
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
  }, [candidateBooks, hasQuery, selectedGenres, sortMode])

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
            Search through a large catalog and filter by one or more genres to see what is most
            popular.
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
              Add genre filter
              <div className="find-genre-add">
                <select value={genrePicker} onChange={(event) => setGenrePicker(event.target.value)}>
                  <option value="">Choose genre</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="find-add-genre-btn"
                  onClick={addGenreFilter}
                  disabled={!genrePicker}
                >
                  Add
                </button>
              </div>
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

          {selectedGenres.length > 0 ? (
            <div className="find-genre-pills" aria-label="Selected genres">
              {selectedGenres.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className="find-genre-pill"
                  onClick={() => removeGenreFilter(genre)}
                >
                  {genre} ×
                </button>
              ))}
              <button type="button" className="find-genre-clear" onClick={clearGenreFilters}>
                Clear all
              </button>
            </div>
          ) : (
            <p className="source-note">No genre filter selected. Showing all available genres.</p>
          )}

          <SourceBadge source={source} />
          {!hasQuery && selectedGenres.length > 0 ? (
            <p className="source-note">
              Building a live genre feed from the web for: <strong>{selectedGenres.join(', ')}</strong>
            </p>
          ) : null}
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
            hasQuery={hasQuery || hasSearched || selectedGenres.length > 0}
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
