import { Link } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'

export function BrowsePage() {
  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>Browse</h1>
          <p className="browse-subtitle">
            Explore by genres, then filter and scroll through books.
          </p>

          <div className="feature-panel browse-tiles">
            <Link className="browse-tile-link" to="/browse/genres">
              <article>
                <h2>Genres</h2>
                <p>Pick one or more genres and explore the matching books.</p>
              </article>
            </Link>
            <Link className="browse-tile-link" to="/find">
              <article>
                <h2>Popular by Genre</h2>
                <p>Use Find filters to rank by popularity and genre.</p>
              </article>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
