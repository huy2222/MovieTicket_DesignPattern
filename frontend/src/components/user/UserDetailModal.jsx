import { useState, useEffect } from "react";
import { getUserById } from "../../services/userAdminService";
import "./UserDetailModal.css";

// Premium default avatar SVG with a gradient background
const DefaultAvatar = () => (
  <svg viewBox="0 0 100 100" className="default-avatar-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c20710" />
        <stop offset="100%" stopColor="#e50914" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#avatarGrad)" rx="50" />
    <path
      d="M50 25c6.9 0 12.5 5.6 12.5 12.5S56.9 50 50 50s-12.5-5.6-12.5-12.5S43.1 25 50 25zm0 30c13.8 0 25 7.2 25 16.2V75H25v-3.8c0-9 11.2-16.2 25-16.2z"
      fill="#ffffff"
    />
  </svg>
);

const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  BLOCKED: "Đang bị khóa",
};

export default function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUserById(userId);
        setUser(res.data || res);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết người dùng:", err);
        setError("Không thể tải thông tin chi tiết tài khoản này.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [userId]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!userId) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="user-modal-overlay" onClick={handleOverlayClick}>
      <div className="user-modal-container">
        {/* Header */}
        <div className="user-modal-header">
          <h2 className="user-modal-title">
            <span className="user-modal-title-icon">👤</span> Chi Tiết Tài Khoản
          </h2>
          <button className="user-modal-close" onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="user-modal-body">
          {loading ? (
            <div className="user-modal-loading">
              <div className="user-modal-spinner" />
              <p>Đang tải thông tin chi tiết...</p>
            </div>
          ) : error ? (
            <div className="user-modal-error">
              <span className="user-modal-error-icon">❌</span>
              <p>{error}</p>
            </div>
          ) : user ? (
            <>
              {/* Profile Card */}
              <div className="user-detail-profile-card">
                <div className="user-detail-avatar-wrapper">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || "Avatar"}
                      className="user-detail-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        // Replace with inline SVG standard fallback if loading fails
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  {(!user.avatar || user.avatar === "") ? <DefaultAvatar /> : (
                    <div style={{ display: "none" }}>
                      <DefaultAvatar />
                    </div>
                  )}
                </div>

                <div className="user-detail-main-info">
                  <h3 className="user-detail-name">
                    {user.fullName || "Chưa cập nhật"}
                  </h3>
                  <p className="user-detail-email">{user.email || "Chưa cập nhật"}</p>
                  <span className={`user-detail-status-badge ${user.status?.toLowerCase() || ""}`}>
                    {user.status === "ACTIVE" ? "🟢 " : "🔴 "}
                    {STATUS_LABELS[user.status] || user.status || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              {/* Detail Info Grid */}
              <div className="user-detail-grid">
                <div className="user-detail-item">
                  <span className="user-detail-label">ID Tài Khoản</span>
                  <span className="user-detail-value">#{user.id}</span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">Tuổi</span>
                  <span className="user-detail-value">
                    {user.age !== null && user.age !== undefined ? `${user.age} tuổi` : "Chưa cập nhật"}
                  </span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">Điểm Tích Luỹ (Loyalty)</span>
                  <span className="user-detail-value loyalty-points">
                    ⭐ {user.loyaltyPoints !== null && user.loyaltyPoints !== undefined ? user.loyaltyPoints : "Chưa cập nhật"}
                  </span>
                </div>
                <div className="user-detail-item">
                  <span className="user-detail-label">Ngày tạo tài khoản</span>
                  <span className="user-detail-value">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="user-detail-bio-section">
                <span className="user-detail-label">Giới thiệu (Bio)</span>
                <p className="user-detail-bio-content">
                  {user.bio || "Chưa cập nhật"}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="user-modal-footer">
          <button className="btn-user-modal-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
