import { useMemo, useState } from 'react'
import { fetchOpenLibraryCoverCandidate, resolveCoverCandidates } from '../lib/coverFallback'
import type { Book } from '../lib/types'

interface CoverImageProps {
  book: Book
  alt: string
  className: string
  placeholderClassName: string
  placeholderText?: string
}

export function CoverImage({
  book,
  alt,
  className,
  placeholderClassName,
  placeholderText = 'No cover',
}: CoverImageProps) {
  const baseCandidates = useMemo(() => resolveCoverCandidates(book), [book])
  const [dynamicCandidates, setDynamicCandidates] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [searchedOpenLibrary, setSearchedOpenLibrary] = useState(false)

  const candidates = useMemo(
    () => Array.from(new Set([...baseCandidates, ...dynamicCandidates])),
    [baseCandidates, dynamicCandidates],
  )
  const src = candidates[index]

  async function tryOpenLibraryCandidate(): Promise<void> {
    if (searchedOpenLibrary) {
      return
    }
    setSearchedOpenLibrary(true)
    const fetched = await fetchOpenLibraryCoverCandidate(book)
    if (!fetched) {
      setIndex((previous) => previous + 1)
      return
    }

    setDynamicCandidates((previous) => {
      if (previous.includes(fetched) || baseCandidates.includes(fetched)) {
        return previous
      }
      return [...previous, fetched]
    })
    setIndex((previous) => previous + 1)
  }

  if (!src) {
    return (
      <div className={placeholderClassName} aria-hidden="true">
        {placeholderText}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((previous) => previous + 1)
          return
        }
        void tryOpenLibraryCandidate()
      }}
    />
  )
}
