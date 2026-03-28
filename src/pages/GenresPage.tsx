import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { fetchGenres } from '../lib/genreBrowse'
import type { GenreCount } from '../lib/types'

export function GenresPage() {
  const [genres, setGenres] = useState<GenreCount[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Genres</h1>
          <p className="browse-subtitle">
            Explore all books by genre. Select one to open a scrollable book feed.
          </p>

          {loading ? (
            <div className="genre-list">
              {Array.from({ length: 10 }, (_, index) => (
                <div key={`genre-skeleton-${index}`} className="genre-row skeleton-line" />
              ))}
            </div>
          ) : (
            <div className="genre-list">
              {topGenres.map((genre) => (
                <Link
                  key={genre.name}
                  className="genre-row"
                  to={`/browse/genres/${encodeURIComponent(genre.name.toLowerCase())}`}
                >
                  <span>{genre.name}</span>
                  <span>{genre.count.toLocaleString()} books</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
