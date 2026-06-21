import './Header.css'
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
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
  const isLoggedIn = Boolean(token && user);
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">CINEMAX</Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/cinemas" className="nav-link">
                    Manage Cinemas
                  </Link>
                  <Link to="/admin/vouchers" className="nav-link admin-nav-link" style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    Admin Panel
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/movies" className="nav-link">
                    Movies
                  </Link>
                  <Link to="/bookings" className="nav-link">
                    Bookings
                  </Link>
                  <Link to="/account" className="nav-link">
                    {user.fullName || "Account"}
                  </Link>
                </>
              )}
              <span className="role-badge">{user.role}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>
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
