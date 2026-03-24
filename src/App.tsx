import { useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import type { Book, ShelfStatus } from './lib/types'
import { loadBookCache } from './lib/bookStore'
import { getBookIdentifier, loadShelves, persistShelves, removeShelfValue } from './lib/shelves'
import { hasShelfSyncEndpoint, syncShelfChange } from './lib/shelfSync'
import { useBookSearch } from './hooks/useBookSearch'
import { HomePage } from './pages/HomePage'
import { BookDetailPage } from './pages/BookDetailPage'

function App() {
  const initialCache = useMemo(() => loadBookCache(), [])
  const [shelves, setShelves] = useState<Record<string, ShelfStatus>>(() => loadShelves())

  const {
    query,
    books,
    bookCache,
    source,
    loading,
    error,
    hasSearched,
    runSearch,
  } = useBookSearch({
    initialQuery: '',
    initialBooks: initialCache,
  })

  const booksById = useMemo(() => {
    return bookCache.reduce<Record<string, Book>>((acc, book) => {
      acc[book.id] = book
      return acc
    }, {})
  }, [bookCache])

  async function updateShelf(book: Book, status: ShelfStatus): Promise<void> {
    const key = getBookIdentifier(book)
    const next = { ...shelves, [key]: status }
    setShelves(next)
    persistShelves(next)
    try {
      await syncShelfChange(book, status)
    } catch {
      // Non-blocking sync: local state is still source-of-truth for UX responsiveness.
    }
  }

  async function removeShelf(book: Book): Promise<void> {
    const next = removeShelfValue(book, shelves)
    setShelves(next)
    persistShelves(next)
    try {
      await syncShelfChange(book, null)
    } catch {
      // Non-blocking sync: local removal should remain instant.
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            books={books}
            query={query}
            source={source}
            loading={loading}
            error={error}
            hasSearched={hasSearched}
            shelves={shelves}
            shelfSyncEnabled={hasShelfSyncEndpoint()}
            onSearchDebounced={(value) => {
              void runSearch(value)
            }}
            onSearchSubmit={(value) => {
              void runSearch(value)
            }}
            onShelfChange={(book, status) => {
              void updateShelf(book, status)
            }}
            onShelfRemove={(book) => {
              return removeShelf(book)
            }}
          />
        }
      />
      <Route
        path="/book/:id"
        element={
          <BookDetailPage
            booksById={booksById}
            shelves={shelves}
            onShelfChange={(book, status) => {
              void updateShelf(book, status)
            }}
            onShelfRemove={removeShelf}
          />
        }
      />
    </Routes>
  )
}

export default App
