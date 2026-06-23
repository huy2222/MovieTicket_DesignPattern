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
      <button
        className={`sidebar-toggle ${!isOpen ? "collapsed" : ""}`}
        onClick={onToggle}
        title={isOpen ? "Thu gọn sidebar" : "Mở sidebar"}
        aria-label={isOpen ? "Thu gọn sidebar" : "Mở sidebar"}
      >
        {isOpen ? "‹" : "›"}
      </button>

      <aside className={`admin-sidebar ${!isOpen ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <h1 className="sidebar-logo-text">Cinemax</h1>
          <span className="sidebar-logo-badge">Quản trị</span>
        </div>

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
            Tổng quan
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
          <NavLink
            to="/admin/cinemas"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">🏢</span>
            Rạp chiếu
          </NavLink>
          <NavLink
            to="/admin/rooms"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">#</span>
            Phòng chiếu
          </NavLink>
        </nav>

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
