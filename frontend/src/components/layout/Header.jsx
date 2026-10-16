import './Header.css'
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const navClassName = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`;

  const bookingNavClassName = () =>
    `nav-link${location.pathname.startsWith("/booking") ? " active" : ""}`;

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
          <NavLink to="/" end className={navClassName}>
            Trang chủ
          </NavLink>
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <NavLink to="/admin" className={({ isActive }) =>
                  `nav-link admin-nav-link${isActive ? " active" : ""}`
                }>
                  Bảng quản trị
                </NavLink>
              ) : (
                <>
                  <NavLink to="/movies" className={navClassName}>
                    Phim
                  </NavLink>
                  <NavLink to="/bookings" className={bookingNavClassName}>
                    Đặt vé
                  </NavLink>
                  <NavLink to="/my-tickets" className={navClassName}>
                    🎫 Vé của tôi
                  </NavLink>
                  {(user?.role === "STAFF" || user?.role === "ADMIN") && (
                    <NavLink to="/staff/combos" className={({ isActive }) =>
                      `nav-link text-[#ef4444] font-bold${isActive ? " active" : ""}`
                    }>
                      🍿 Giao Combo
                    </NavLink>
                  )}
                  <NavLink
                    to="/cinemeet"
                    className={navClassName}
                  >
                    CineMeet
                  </NavLink>
                  <NavLink to="/account" className={navClassName}>
                    {user.fullName || "Tài khoản"}
                  </NavLink>

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
            <NavLink to="/login" className={navClassName}>
              Đăng nhập
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
