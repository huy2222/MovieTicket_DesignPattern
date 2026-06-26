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
            Trang chủ
          </Link>
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className="nav-link admin-nav-link">
                  Bảng quản trị
                </Link>
              ) : (
                <>
                  <Link to="/movies" className="nav-link">
                    Phim
                  </Link>
                  <Link to="/bookings" className="nav-link">
                    Đặt vé
                  </Link>
                  <Link to="/my-tickets" className="nav-link">
                    🎫 Vé của tôi
                  </Link>
                  <Link to="/account" className="nav-link">
                    {user.fullName || "Tài khoản"}
                  </Link>
                </>
              )}
              <span className="role-badge">
                {isAdmin ? "Quản trị" : user.role}
              </span>
              <button type="button" className="logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
