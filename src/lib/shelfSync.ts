import type { Book, ShelfStatus } from './types'

const DJANGO_SYNC_ENDPOINT = import.meta.env.VITE_DJANGO_SHELF_SYNC_URL

interface SyncShelfPayload {
  book_id: string
  book_title: string
  shelf: ShelfStatus | null
  isbn13?: string
  isbn10?: string
}

export function hasShelfSyncEndpoint(): boolean {
  return Boolean(DJANGO_SYNC_ENDPOINT)
}

export async function syncShelfChange(book: Book, status: ShelfStatus | null): Promise<void> {
  if (!DJANGO_SYNC_ENDPOINT) {
    return
  }

  const payload: SyncShelfPayload = {
    book_id: book.id,
    book_title: book.title,
    shelf: status,
    isbn13: book.isbn13,
    isbn10: book.isbn10,
  }

  await fetch(DJANGO_SYNC_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
}
