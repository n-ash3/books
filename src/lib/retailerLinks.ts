import type { Book, RetailerLink } from './types'

function encode(value: string): string {
  return encodeURIComponent(value)
}

function queryFromBook(book: Book): string {
  if (book.isbn13) {
    return book.isbn13
  }
  if (book.isbn10) {
    return book.isbn10
  }
  return `${book.title} ${book.author}`
}

export function buildRetailerLinks(book: Book): RetailerLink[] {
  const query = encode(queryFromBook(book))

  return [
    {
      name: 'Amazon',
      url: `https://www.amazon.com/s?k=${query}&i=stripbooks`,
    },
    {
      name: 'Barnes & Noble',
      url: `https://www.barnesandnoble.com/s/${query}`,
    },
    {
      name: 'Target',
      url: `https://www.target.com/s?searchTerm=${query}&category=5xtd5`,
    },
    {
      name: 'Books-A-Million',
      url: `https://www.booksamillion.com/search?query=${query}`,
    },
  ]
}
