import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

export default function AdminSidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`sidebar-toggle ${!isOpen ? "collapsed" : ""}`}
        onClick={onToggle}
        title={isOpen ? "Thu gọn sidebar" : "Mở sidebar"}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${!isOpen ? "collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <h1 className="sidebar-logo-text">Cinemax</h1>
          <span className="sidebar-logo-badge">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Tổng quan</p>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">📊</span>
            Dashboard
          </NavLink>

          <p className="sidebar-section-label">Quản lý</p>
          <NavLink
            to="/admin/vouchers"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">🎫</span>
            Khuyến mãi
          </NavLink>
          <NavLink
            to="/admin/movies"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">🎬</span>
            Phim
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
