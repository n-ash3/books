interface SearchStateProps {
  loading: boolean
  hasQuery: boolean
  hasResults: boolean
}

function SkeletonCard() {
  return (
    <article className="book-card skeleton-card" aria-hidden="true">
      <div className="book-cover skeleton-block" />
      <div className="book-meta">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-author" />
        <div className="skeleton-line skeleton-rating" />
      </div>
      <div className="skeleton-line skeleton-select" />
      <div className="skeleton-line skeleton-button" />
    </article>
  )
}

export function SearchState({ loading, hasQuery, hasResults }: SearchStateProps) {
  if (loading) {
    return (
      <div className="book-grid" aria-live="polite">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    )
  }

  if (hasQuery && !hasResults) {
    return (
      <section className="no-results panel">
        <h3>No results found</h3>
        <p>Try a broader title, author name, or ISBN.</p>
        <ul>
          <li>Remove punctuation or subtitles</li>
          <li>Try searching by author only</li>
          <li>Check spelling and spacing</li>
        </ul>
      </section>
    )
  }

  return null
}
