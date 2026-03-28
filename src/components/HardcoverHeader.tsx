import { Link } from 'react-router-dom'

export function HardcoverHeader() {
  return (
    <header className="hardcover-header">
      <div className="hardcover-header__inner">
        <Link to="/" className="brand-link">
          <span className="brand-dot" aria-hidden="true">
            ■
          </span>
          <span>Hardcover Clone</span>
        </Link>
        <nav className="hardcover-nav">
          <Link to="/" className="nav-chip">
            Discover
          </Link>
          <Link to="/browse/genres" className="nav-chip">
            Browse
          </Link>
          <a href="https://docs.hardcover.app/" target="_blank" rel="noreferrer" className="nav-chip">
            API Docs
          </a>
        </nav>
      </div>
    </header>
  )
}
