import { useState, useEffect, useCallback } from "react";
import {
  getAllUsers,
  blockUser,
  unblockUser,
} from "../../../services/userAdminService";
import UserDetailModal from "../../../components/user/UserDetailModal";
import "./CustomerManagementPage.css"; 


const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  BLOCKED: "Đang bị khóa",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// Component chính
// ============================================

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ---- Tải danh sách người dùng ----
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data || res); // Tùy cấu trúc API trả về
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
      showToast("Không thể tải danh sách tài khoản", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ---- Toast thông báo ----
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Hành động Khóa / Mở khóa ----
  const handleBlock = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa tài khoản này?")) return;
    try {
      await blockUser(id);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === id ? { ...u, status: "BLOCKED" } : u))
      );
      showToast("Đã khóa tài khoản thành công!");
    } catch (err) {
      console.error("Lỗi khi khóa tài khoản:", err);
      showToast("Lỗi khi khóa tài khoản", "error");
    }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn mở khóa tài khoản này?")) return;
    try {
      await unblockUser(id);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === id ? { ...u, status: "ACTIVE" } : u))
      );
      showToast("Đã mở khóa tài khoản thành công!");
    } catch (err) {
      console.error("Lỗi khi mở khóa tài khoản:", err);
      showToast("Lỗi khi mở khóa tài khoản", "error");
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // ---- Bộ lọc & Tìm kiếm ----
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      String(u.id).includes(search);

    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="user-management-page">
      {/* Thông báo Toast */}
      {toast && (
        <div className={`user-toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Tiêu đề trang */}
      <div className="user-page-header">
        <h1 className="user-page-title">
          <span className="user-page-title-icon">👥</span>
          Quản lý Tài khoản Người dùng
          <span className="user-count-badge">{users.length} thành viên</span>
        </h1>
      </div>

      {/* Thanh công cụ Tìm kiếm & Lọc */}
      <div className="user-toolbar">
        <div className="user-search">
          <span className="user-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo ID, Email hoặc Tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="user-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">🟢 Đang hoạt động</option>
          <option value="BLOCKED">🔴 Đang bị khóa</option>
        </select>
      </div>

      {/* Nội dung danh sách / Table */}
      {loading ? (
        <div className="user-loading">
          <div className="user-loading-spinner" />
          <p>Đang tải dữ liệu người dùng...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="user-empty">
          <div className="user-empty-icon">👥</div>
          <h3>Không tìm thấy kết quả</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thông tin tài khoản</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  {/* ID */}
                  <td>
                    <span className="user-id-badge">#{user.id}</span>
                  </td>

                  {/* Email & Tên */}
                  <td>
                    <div className="user-info-cell">
                      <strong>{user.fullName || "Chưa cập nhật tên"}</strong>
                      <div className="user-email-sub">{user.email}</div>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td>
                    <span className={`status-badge ${user.status?.toLowerCase() || ""}`}>
                      {user.status === "ACTIVE" ? "🟢 " : "🔴 "}
                      {STATUS_LABELS[user.status] || user.status}
                    </span>
                  </td>

                  {/* Ngày tạo */}
                  <td>
                    <div className="user-date">{formatDate(user.createdAt)}</div>
                  </td>

                  {/* Hành động */}
                  <td>
                    <div className="user-actions">
                      <button
                        className="btn-action view"
                        onClick={() => handleViewDetail(user)}
                        title="Xem chi tiết"
                      >
                        👁️ Xem
                      </button>

                      {user.status === "ACTIVE" ? (
                        <button
                          className="btn-action block"
                          onClick={() => handleBlock(user.id)}
                          title="Khóa tài khoản"
                        >
                          🔒 Khóa
                        </button>
                      ) : (
                        <button
                          className="btn-action unblock"
                          onClick={() => handleUnblock(user.id)}
                          title="Mở khóa tài khoản"
                        >
                          🔓 Mở khóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết người dùng */}
      {modalOpen && selectedUser && (
        <UserDetailModal
          userId={selectedUser.id}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}