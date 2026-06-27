import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function SidebarIcon({ name }) {
  const commonProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    dashboard: (
      <svg {...commonProps}>
        <rect x="3" y="3" width="7" height="8" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="15" width="7" height="6" rx="1.5" />
      </svg>
    ),
    voucher: (
      <svg {...commonProps}>
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7Z" />
        <path d="M9 8h.01" />
        <path d="M9 12h.01" />
        <path d="M9 16h.01" />
        <path d="M13 9h4" />
        <path d="M13 15h4" />
      </svg>
    ),
    movie: (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 5v14" />
        <path d="M16 5v14" />
        <path d="M4 9h4" />
        <path d="M4 15h4" />
        <path d="M16 9h4" />
        <path d="M16 15h4" />
      </svg>
    ),
    cinema: (
      <svg {...commonProps}>
        <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
        <path d="M17 9h1a2 2 0 0 1 2 2v10" />
        <path d="M8 7h.01" />
        <path d="M12 7h.01" />
        <path d="M8 11h.01" />
        <path d="M12 11h.01" />
        <path d="M8 15h.01" />
        <path d="M12 15h.01" />
        <path d="M2 21h20" />
      </svg>
    ),
    room: (
      <svg {...commonProps}>
        <path d="M5 4h14v5H5z" />
        <path d="M7 14h2" />
        <path d="M11 14h2" />
        <path d="M15 14h2" />
        <path d="M7 18h2" />
        <path d="M11 18h2" />
        <path d="M15 18h2" />
        <path d="M4 22h16" />
      </svg>
    ),
    showtime: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
        <path d="M5 4 3 6" />
        <path d="m19 4 2 2" />
      </svg>
    ),
    ticket: (
      <svg {...commonProps}>
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    ),
    employee: (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    users: (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    logout: (
      <svg {...commonProps}>
        <path d="M10 17 15 12 10 7" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
        <path d="M14 21h5a2 2 0 0 0 2-2" />
      </svg>
    ),
  };

  return <span className="sidebar-link-icon">{icons[name]}</span>;
}

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
            <SidebarIcon name="dashboard" />
            Tổng quan
          </NavLink>

          <p className="sidebar-section-label">Quản lý</p>
          <NavLink
            to="/admin/vouchers"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <SidebarIcon name="voucher" />
            Khuyến mãi
          </NavLink>
          <NavLink
            to="/admin/movies"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <SidebarIcon name="movie" />
            Phim
          </NavLink>
          <NavLink
            to="/admin/cinemas"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <SidebarIcon name="cinema" />
            Rạp chiếu
          </NavLink>
          <NavLink
            to="/admin/rooms"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <SidebarIcon name="room" />
            Phòng chiếu
          </NavLink>

          <NavLink
            to="/admin/showtimes"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <SidebarIcon name="showtime" />
            Lịch chiếu
          </NavLink>
          
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <SidebarIcon name="showtime" />
            Tài khoản khách hàng
          </NavLink>
          


        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <SidebarIcon name="logout" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
