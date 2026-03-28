import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { fetchGenres } from '../lib/genreBrowse'
import type { GenreCount } from '../lib/types'

export function GenresPage() {
  const [genres, setGenres] = useState<GenreCount[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    let active = true
    void (async () => {
      const result = await fetchGenres(18)
      if (!active) {
        return
      }
      setGenres(result)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  const topGenres = useMemo(() => genres.slice(0, 18), [genres])

  function toggleGenre(name: string): void {
    setSelected((previous) => {
      if (previous.includes(name)) {
        return previous.filter((item) => item !== name)
      }
      return [...previous, name]
    })
  }

  const multiBrowsePath = useMemo(() => {
    const serialized = encodeURIComponent(selected.join(','))
    return `/browse/genres/multi/${serialized}`
  }, [selected])

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Genres</h1>
          <p className="browse-subtitle">
            Explore all books by genre. Select one to open a scrollable book feed.
          </p>
          <p className="source-note">You can also select multiple genres below.</p>

          {loading ? (
            <div className="genre-list">
              {Array.from({ length: 10 }, (_, index) => (
                <div key={`genre-skeleton-${index}`} className="genre-row skeleton-line" />
              ))}
            </div>
          ) : (
            <div className="genre-list">
              {topGenres.map((genre) => (
                <div key={genre.name} className="genre-row-wrap">
                  <Link
                    className="genre-row"
                    to={`/browse/genres/${encodeURIComponent(genre.name.toLowerCase())}`}
                  >
                    <span>{genre.name}</span>
                    <span>{genre.count.toLocaleString()} books</span>
                  </Link>
                  <button
                    type="button"
                    className={`genre-select-chip${selected.includes(genre.name) ? ' genre-select-chip--active' : ''}`}
                    onClick={() => toggleGenre(genre.name)}
                  >
                    {selected.includes(genre.name) ? 'Selected' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {selected.length > 0 ? (
            <div className="genre-multi-actions">
              <p className="source-note">
                Selected: <strong>{selected.join(', ')}</strong>
              </p>
              <Link className="details-cta" to={multiBrowsePath}>
                Browse selected genres
              </Link>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}
