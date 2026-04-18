import { HardcoverHeader } from '../components/HardcoverHeader'
import { TV_SHOWS_FROM_BOOKS } from '../data/tvShowsFromBooks'

export function TVShowsPage() {
  return (
    <div className="browse-root">
      <HardcoverHeader />
      <main className="browse-main">
        <section className="browse-panel">
          <h1>TV Shows Based on Books</h1>
          <p className="browse-subtitle">
            Explore TV series adapted from books, with details about each show and source title.
          </p>
        </section>

        <section className="panel discover-panel">
          <div className="section-title">
            <h2>Book-to-Screen TV Catalog</h2>
            <p>Every show listed here is based on a published book or book series.</p>
          </div>

          <div className="tv-grid">
            {TV_SHOWS_FROM_BOOKS.map((show) => (
              <article key={show.id} className="tv-card">
                <div className="tv-card-head">
                  <h3>{show.title}</h3>
                  <p className="tv-meta-line">
                    {show.network} • {show.years}
                  </p>
                </div>

                <p className="tv-synopsis">{show.synopsis}</p>

                <div className="tv-details">
                  <p>
                    <strong>Based on:</strong> {show.basedOnBook}
                  </p>
                  <p>
                    <strong>Book author:</strong> {show.bookAuthor}
                  </p>
                  <p>
                    <strong>Seasons:</strong> {show.seasons}
                  </p>
                </div>

                <div className="pill-row">
                  {show.genres.map((genre) => (
                    <span className="pill" key={`${show.id}-${genre}`}>
                      {genre}
                    </span>
                  ))}
                </div>

                <a
                  className="details-cta tv-info-link"
                  href={show.infoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Show information
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
