import { Link, NavLink } from 'react-router-dom'

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
          <NavLink to="/find" className={({ isActive }) => `nav-chip${isActive ? ' nav-chip--active' : ''}`}>
            Find
          </NavLink>
          <NavLink to="/track" className={({ isActive }) => `nav-chip${isActive ? ' nav-chip--active' : ''}`}>
            Track
          </NavLink>
          <NavLink
            to="/discover"
            className={({ isActive }) => `nav-chip${isActive ? ' nav-chip--active' : ''}`}
          >
            Discover
          </NavLink>
          <NavLink
            to="/browse/genres"
            className={({ isActive }) => `nav-chip${isActive ? ' nav-chip--active' : ''}`}
          >
            Browse
          </NavLink>
          <a href="https://docs.hardcover.app/" target="_blank" rel="noreferrer" className="nav-chip">
            API Docs
          </a>
        </nav>
      </div>
    </header>
  )
}
