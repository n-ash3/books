import { formatShelfLabel } from '../lib/shelves'
import type { ShelfStatus } from '../lib/types'

interface ShelfTabsProps {
  active: ShelfStatus
  counts: Record<ShelfStatus, number>
  onChange: (value: ShelfStatus) => void
}

const ORDER: ShelfStatus[] = [
  'want_to_read',
  'currently_reading',
  'read',
  'did_not_finish',
]

function formatTabLabel(status: ShelfStatus): string {
  if (status === 'want_to_read') {
    return 'TBR'
  }
  return formatShelfLabel(status)
}

export function ShelfTabs({ active, counts, onChange }: ShelfTabsProps) {
  return (
    <div className="shelf-tabs" role="tablist" aria-label="Track shelves">
      {ORDER.map((status) => (
        <button
          key={status}
          type="button"
          role="tab"
          aria-selected={active === status}
          className={`shelf-tab${active === status ? ' shelf-tab--active' : ''}`}
          onClick={() => onChange(status)}
        >
          <span className="shelf-tab-label">{formatTabLabel(status)}</span>
          <span className="shelf-tab-count">{counts[status]}</span>
        </button>
      ))}
    </div>
  )
}
