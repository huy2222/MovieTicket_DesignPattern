import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra quyền admin khi mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN") {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Lấy thông tin user
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr);
    } catch {
      // ignore
    }
    return { fullName: "Admin", email: "" };
  };

  const user = getUserInfo();
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className={`admin-content ${!sidebarOpen ? "expanded" : ""}`}>
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            {/* Page title sẽ được mỗi trang tự render */}
          </div>
          <div className="admin-topbar-right">
            <div className="admin-user-info">
              <div className="admin-user-avatar">{initials}</div>
              <div>
                <div className="admin-user-name">{user.fullName}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
}
