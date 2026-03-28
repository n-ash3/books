import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  value: string
  onDebouncedChange: (next: string) => void
  onSubmit: (next: string) => void
  loading: boolean
}

export function SearchBar({ value, onDebouncedChange, onSubmit, loading }: SearchBarProps) {
  const [draft, setDraft] = useState(value)
  const mountedRef = useRef(false)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const handle = window.setTimeout(() => {
      onDebouncedChange(draft)
    }, 350)

    return () => {
      window.clearTimeout(handle)
    }
  }, [draft, onDebouncedChange])

  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(draft)
      }}
    >
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search books, authors, ISBN, series..."
        aria-label="Search books"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Searching...' : 'Find Books'}
      </button>
    </form>
  )
}
