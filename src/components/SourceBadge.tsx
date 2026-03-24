import type { SearchResult } from '../lib/types'

interface SourceBadgeProps {
  source: SearchResult['source']
}

function sourceLabel(source: SearchResult['source']): string {
  if (source === 'hardcover') {
    return 'Hardcover API'
  }
  if (source === 'googlebooks') {
    return 'Google Books'
  }
  if (source === 'openlibrary') {
    return 'Open Library'
  }
  if (source === 'mixed') {
    return 'Hardcover + Google Books + Open Library'
  }
  return 'Fallback seed data'
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <p className="source-note">
      Data source: <strong>{sourceLabel(source)}</strong>
    </p>
  )
}
