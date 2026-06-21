import './Header.css'
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(localStorage.getItem("token") && user);
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
                <Link to="/admin/cinemas" className="nav-link">
                  Manage Cinemas
                </Link>
              ) : (
                <Link to="/account" className="nav-link">
                  Account
                </Link>
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
