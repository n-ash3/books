import { useCallback, useEffect, useMemo, useState } from 'react'
import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import { updateBookCacheWithResults } from '../lib/bookStore'
import { searchBooks } from '../lib/bookSearch'
import type { Book, SearchResult } from '../lib/types'

interface UseBookSearchOptions {
  initialQuery: string
  initialBooks: Book[]
}

interface UseBookSearchResult {
  query: string
  setQuery: (value: string) => void
  books: Book[]
  bookCache: Book[]
  source: SearchResult['source']
  loading: boolean
  error: string
  hasSearched: boolean
  runSearch: (term: string) => Promise<void>
  clearSearch: () => void
}

export function useBookSearch({
  initialQuery,
  initialBooks,
}: UseBookSearchOptions): UseBookSearchResult {
  const [query, setQuery] = useState(initialQuery)
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [bookCache, setBookCache] = useState<Book[]>(initialBooks)
  const [source, setSource] = useState<SearchResult['source']>('fallback')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const clearSearch = useCallback(() => {
    setBooks(FALLBACK_BOOKS)
    setSource('fallback')
    setError('')
    setHasSearched(false)
  }, [])

  const runSearch = useCallback(async (term: string) => {
    const trimmed = term.trim()
    setQuery(term)

    if (!trimmed) {
      clearSearch()
      return
    }

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const result = await searchBooks(trimmed)
      setBooks(result.books)
      setBookCache((previous) => updateBookCacheWithResults(previous, result.books))
      setSource(result.source)
      setError(result.error ?? '')
    } catch {
      setBooks(FALLBACK_BOOKS)
      setSource('fallback')
      setError('Search failed. Showing fallback titles.')
    } finally {
      setLoading(false)
    }
  }, [clearSearch])

  useEffect(() => {
    if (books.length > 0) {
      setBookCache((previous) => updateBookCacheWithResults(previous, books))
    }
  }, [books])

  return useMemo(
    () => ({
      query,
      setQuery,
      books,
      bookCache,
      source,
      loading,
      error,
      hasSearched,
      runSearch,
      clearSearch,
    }),
    [bookCache, books, clearSearch, error, hasSearched, loading, query, runSearch, source],
  )
}
