import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import supportRequestService from "../../services/supportRequestService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./SupportPage.css";

const ISSUE_TYPES = [
  "Tài khoản",
  "Đặt vé",
  "Thanh toán",
  "Phim",
  "Lỗi hệ thống",
  "Khác",
];

const SupportPage = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'history'
  const [form, setForm] = useState({
    title: "",
    content: "",
    issueType: "",
  });

  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { id, message, status }
  const [error, setError] = useState("");

  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await supportRequestService.getMyRequests();
      setMyRequests(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessInfo(null);
    setError("");

    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề yêu cầu.");
      return;
    }

    if (!form.issueType) {
      setError("Vui lòng chọn loại vấn đề.");
      return;
    }

    if (!form.content.trim()) {
      setError("Vui lòng nhập nội dung yêu cầu.");
      return;
    }

    if (form.content.length > 5000) {
      setError("Nội dung yêu cầu không được vượt quá 5000 ký tự.");
      return;
    }

    try {
      setLoading(true);
      const response = await supportRequestService.create(form);

      if (response && (response.success || response.id)) {
        setSuccessInfo({
          id: response.id,
          status: response.status || "Chờ xử lý",
          message:
            response.message || "Gửi yêu cầu hỗ trợ thành công",
        });

        setForm({
          title: "",
          content: "",
          issueType: "",
        });

        fetchMyRequests();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gửi yêu cầu hỗ trợ thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      title: "",
      content: "",
      issueType: "",
    });
    setSuccessInfo(null);
    setError("");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return "pending";
      case "Đang xử lý":
        return "processing";
      case "Đã giải quyết":
        return "resolved";
      default:
        return "rejected";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const content = (
    <div className="support-main-container">
      <div className="support-header-section">
        <h1>🎧 Trung Tâm Hỗ Trợ Khách Hàng</h1>
        <p>
          Bạn đang gặp vấn đề hoặc có thắc mắc cần giải đáp? Hãy gửi yêu cầu hỗ trợ,
          đội ngũ chăm sóc khách hàng của chúng tôi sẽ phản hồi sớm nhất có thể.
        </p>
      </div>

      <div className="support-tabs">
        <button
          type="button"
          className={`support-tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          ✍️ Gửi yêu cầu mới
        </button>
        <button
          type="button"
          className={`support-tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("history");
            fetchMyRequests();
          }}
        >
          📋 Yêu cầu đã gửi{" "}
          {myRequests.length > 0 && (
            <span className="support-tab-badge">{myRequests.length}</span>
          )}
        </button>
      </div>

      {activeTab === "create" && (
        <div className="support-card">
          <h2>Gửi Yêu Cầu Hỗ Trợ</h2>

          {successInfo && (
            <div className="support-alert success">
              <p>
                <strong>🎉 {successInfo.message}!</strong>
              </p>
              <p>
                Mã yêu cầu của bạn: <strong>#{successInfo.id}</strong> — Trạng thái
                ban đầu: <strong>{successInfo.status}</strong>.
              </p>
              <div className="support-success-actions">
                <span
                  className="support-success-link"
                  onClick={() => setActiveTab("history")}
                >
                  👉 Chuyển đến danh sách yêu cầu của tôi để theo dõi tiến độ
                </span>
              </div>
            </div>
          )}

          {error && <div className="support-alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="support-form-group">
              <label>
                Tiêu đề <span>*</span>
              </label>
              <input
                type="text"
                name="title"
                className="support-form-control"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                placeholder="Nhập tiêu đề yêu cầu (ví dụ: Lỗi thanh toán đặt vé, Vấn đề đổi mật khẩu...)"
              />
            </div>

            <div className="support-form-group">
              <label>
                Loại vấn đề <span>*</span>
              </label>
              <select
                name="issueType"
                className="support-form-control"
                value={form.issueType}
                onChange={handleChange}
              >
                <option value="">-- Chọn loại vấn đề --</option>
                {ISSUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="support-form-group">
              <label>
                Nội dung yêu cầu <span>*</span>
              </label>
              <textarea
                name="content"
                className="support-form-control"
                value={form.content}
                onChange={handleChange}
                maxLength={5000}
                rows={7}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi có thể hỗ trợ nhanh nhất..."
              />
              <small className="support-char-count">
                {form.content.length} / 5000 ký tự
              </small>
            </div>

            <div className="support-btn-group">
              <button
                type="button"
                className="btn-support-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-support-submit"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "history" && (
        <div className="support-card">
          <h2>Danh Sách Yêu Cầu Của Tôi</h2>

          {loadingRequests ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="spinner-border text-danger" role="status" />
              <p className="mt-3 text-muted">Đang tải lịch sử yêu cầu...</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <span style={{ fontSize: "3rem" }}>📭</span>
              <h3 className="mt-3">Bạn chưa có yêu cầu hỗ trợ nào.</h3>
              <p className="text-muted">
                Nếu gặp bất kỳ khó khăn nào trong quá trình sử dụng hệ thống, hãy gửi
                yêu cầu hỗ trợ cho chúng tôi.
              </p>
              <button
                type="button"
                className="btn-support-submit mt-3"
                onClick={() => setActiveTab("create")}
              >
                Tạo yêu cầu hỗ trợ ngay
              </button>
            </div>
          ) : (
            <div className="support-table-wrap">
              <table className="support-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tiêu đề</th>
                    <th>Loại vấn đề</th>
                    <th>Thời gian gửi</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>#{req.id}</strong>
                      </td>
                      <td>
                        <strong>{req.title}</strong>
                      </td>
                      <td>
                        <span className="badge-issue">{req.issueType}</span>
                      </td>
                      <td>{formatDate(req.createdAt)}</td>
                      <td>
                        <span
                          className={`badge-status ${getStatusClass(req.status)}`}
                        >
                          {req.status || "Chờ xử lý"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-view-ticket"
                          onClick={() => setSelectedTicket(req)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="support-modal-backdrop"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="support-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="support-modal-header">
              <h3>Chi Tiết Yêu Cầu #{selectedTicket.id}</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </button>
            </div>

            <h4 style={{ color: "#fff", marginBottom: "12px" }}>
              {selectedTicket.title}
            </h4>

            <div className="support-modal-meta">
              <span>
                <strong>Loại:</strong> {selectedTicket.issueType}
              </span>
              <span>•</span>
              <span>
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={`badge-status ${getStatusClass(selectedTicket.status)}`}
                >
                  {selectedTicket.status || "Chờ xử lý"}
                </span>
              </span>
              <span>•</span>
              <span>
                <strong>Thời gian gửi:</strong> {formatDate(selectedTicket.createdAt)}
              </span>
            </div>

            <div style={{ marginBottom: "8px", fontWeight: "600", color: "#9ca3af" }}>
              Nội dung yêu cầu:
            </div>
            <div className="support-modal-content-box">
              {selectedTicket.content}
            </div>

            <div style={{ textAlign: "right", marginTop: "25px" }}>
              <button
                type="button"
                className="btn-support-cancel"
                onClick={() => setSelectedTicket(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isAdminRoute) {
    return <div className="support-page-wrapper">{content}</div>;
  }

  return (
    <div className="support-page-wrapper">
      <Header />
      {content}
      <Footer />
    </div>
  );
};

export default SupportPage;