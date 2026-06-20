import './Header.css'
import { Link } from "react-router-dom";

export default function Header() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;
  if (token && userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // ignore
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

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
          {user && (
            <Link to="/bookings" className="nav-link">
              Bookings
            </Link>
          )}
          {user && user.role === "ADMIN" && (
            <Link to="/admin/vouchers" className="nav-link admin-nav-link" style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              Admin Panel
            </Link>
          )}
          {user ? (
            <>
              {user.role !== "ADMIN" && (
                <Link to="/account" className="nav-link">
                  {user.fullName || "Account"}
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="nav-link" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'inherit', 
                  font: 'inherit', 
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}