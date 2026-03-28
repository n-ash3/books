import type { Book, ShelfStatus } from './types'

const STORAGE_KEY = 'book-smart.shelves.v1'

export const SHELF_OPTIONS: Array<{ value: ShelfStatus; label: string }> = [
  { value: 'want_to_read', label: 'Want to Read (TBR)' },
  { value: 'currently_reading', label: 'Currently Reading' },
  { value: 'read', label: 'Read' },
  { value: 'did_not_finish', label: 'Did Not Finish' },
]

export function formatShelfLabel(value: ShelfStatus): string {
  return SHELF_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function getBookIdentifier(book: Book): string {
  if (book.isbn13) {
    return book.isbn13
  }
  if (book.isbn10) {
    return book.isbn10
  }
  return `${book.source}:${book.id || `slug:${book.slug}`}`
}

export function loadShelves(): Record<string, ShelfStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as Record<string, ShelfStatus>
    return parsed ?? {}
  } catch {
    return {}
  }
}

export function persistShelves(data: Record<string, ShelfStatus>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getShelfValue(book: Book, shelves: Record<string, ShelfStatus>): ShelfStatus {
  const key = getBookIdentifier(book)
  return shelves[key] ?? 'want_to_read'
}

export function removeShelfValue(
  book: Book,
  shelves: Record<string, ShelfStatus>,
): Record<string, ShelfStatus> {
  const key = getBookIdentifier(book)
  const next = { ...shelves }
  delete next[key]
  return next
}

