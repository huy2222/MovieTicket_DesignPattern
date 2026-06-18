import './Header.css'
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">CINEMAX</h1>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/movies" className="nav-link">
            Movies
          </Link>
          <Link to="/bookings" className="nav-link">
            Bookings
          </Link>
          <Link to="/account" className="nav-link">
            Account
          </Link>
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}