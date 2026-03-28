import type { ShelfValue } from '../lib/types'
import { SHELF_OPTIONS } from '../lib/shelves'

interface ShelfSelectorProps {
  value: ShelfValue
  onChange: (status: ShelfValue) => void
  label?: string
  className?: string
  allowRemove?: boolean
}

export function ShelfSelector({
  value,
  onChange,
  label = 'Shelf',
  className,
  allowRemove = false,
}: ShelfSelectorProps) {
  return (
    <label className={className ?? 'shelf-select'}>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as ShelfValue)}>
        {allowRemove ? <option value="none">No shelf</option> : null}
        {SHELF_OPTIONS.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
