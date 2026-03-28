import { Link } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'

export function HomePage() {
  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel home-hero-panel">
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <h1>Book smart.</h1>
              <p className="browse-subtitle">
                Track every book, share them with the world (or don&apos;t), and discover your next
                life-changing read.
              </p>
              <p className="landing-helper">Choose where you want to start:</p>
            </div>
            <div className="home-hero-illustration" aria-hidden="true" />
          </div>
        </section>

        <section className="feature-panel browse-tiles">
          <Link className="browse-tile-link" to="/find">
            <article>
              <h2>Find</h2>
              <p>Search and browse books with a large catalog and dedicated search page.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/track">
            <article>
              <h2>Track</h2>
              <p>See your TBR, currently reading, read, and did-not-finish shelves.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/discover">
            <article>
              <h2>Discover</h2>
              <p>Get recommendations similar to books you already marked as read.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/browse/genres">
            <article>
              <h2>Browse Genres</h2>
              <p>Open genre choices, then scroll and click through full genre book feeds.</p>
            </article>
          </Link>
        </section>
      </main>
    </div>
  )
}
