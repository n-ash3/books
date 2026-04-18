import { Link } from 'react-router-dom'
import { HardcoverHeader } from '../components/HardcoverHeader'
import { FALLBACK_BOOKS } from '../data/fallbackBooks'
import { CoverImage } from '../components/CoverImage'

export function HomePage() {
  const trending = [...FALLBACK_BOOKS]
    .sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0))
    .slice(0, 6)

  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel home-hero-panel">
          <div className="home-hero-grid">
            <div className="home-hero-illustration" aria-hidden="true" />
            <div className="home-hero-copy">
              <div className="home-app-row">
                <span className="home-app-pill">Get iOS App</span>
                <span className="home-app-pill">Get Android App</span>
              </div>
              <h1>Book smart.</h1>
              <p className="browse-subtitle">
                Track every book, share them with the world (or don&apos;t), and find new
                life-changing reads.
              </p>
              <Link to="/find" className="home-cta-btn">
                Join BookBoard
              </Link>
            </div>
          </div>
        </section>

        <section className="feature-panel browse-tiles">
          <Link className="browse-tile-link" to="/find">
            <article>
              <h2>Find</h2>
              <p>Search and browse books with filters and multi-genre discovery.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/recommendations">
            <article>
              <h2>AI Recommendations</h2>
              <p>Enter your favorite book and get similar books ranked by our recommendation model.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/track">
            <article>
              <h2>Track</h2>
              <p>Track every book by want to read, currently reading, read, and did not finish.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/tv-shows">
            <article>
              <h2>TV from Books</h2>
              <p>Browse TV series adapted from books and view source-title information.</p>
            </article>
          </Link>

          <Link className="browse-tile-link" to="/discover">
            <article>
              <h2>Discover</h2>
              <p>Uncover books and authors based on your reading history and preferences.</p>
            </article>
          </Link>
        </section>

        <section className="panel home-trending-panel">
          <div className="home-trending-head">
            <h2>Trending on BookBoard</h2>
            <div className="home-timeframe">
              <button type="button" className="home-timeframe-btn home-timeframe-btn--active">
                Last 3 months
              </button>
              <button type="button" className="home-timeframe-btn">
                Last year
              </button>
              <button type="button" className="home-timeframe-btn">
                All-time
              </button>
            </div>
          </div>
          <div className="home-trending-grid">
            {trending.map((book, index) => (
              <article key={book.id} className="home-trend-card">
                <span className="home-trend-rank">#{index + 1}</span>
                <CoverImage
                  book={book}
                  alt={`${book.title} cover`}
                  className="home-trend-cover"
                  placeholderClassName="home-trend-cover home-trend-cover--placeholder"
                />
                <div className="home-trend-meta">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <p className="home-trend-stats">
                    {book.rating ? `${book.rating.toFixed(1)} ★` : 'No rating'} •{' '}
                    {book.ratingCount ? `${book.ratingCount.toLocaleString()} ratings` : 'No count'}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="home-trending-actions">
            <Link to="/find" className="details-cta">
              Explore all trending books
            </Link>
            <Link to="/browse/genres" className="details-cta">
              Browse all genres
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
