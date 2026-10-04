import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { searchComboOrders, confirmComboReceived } from "../../services/staffComboService";
import "./StaffComboPage.css";

export default function StaffComboPage() {
  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!bookingCodeInput.trim()) return;

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");
      setOrder(null);
      const data = await searchComboOrders(bookingCodeInput.trim());
      setOrder(data);
    } catch (err) {
      console.error("Lỗi tra cứu combo:", err);
      const msg = err.response?.data?.message || err.response?.data || "Không tìm thấy booking hoặc bạn không có quyền truy cập.";
      setErrorMsg(typeof msg === 'string' ? msg : "Không tìm thấy booking phù hợp.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceive = async (comboId) => {
    try {
      setConfirmingId(comboId);
      setErrorMsg("");
      setSuccessMsg("");
      const updatedCombo = await confirmComboReceived(comboId);

      setSuccessMsg(`Xác nhận giao thành công combo: ${updatedCombo.comboName}!`);

      // Update local order state
      if (order && order.combos) {
        const updatedCombos = order.combos.map((c) =>
          c.id === comboId ? updatedCombo : c
        );
        setOrder({ ...order, combos: updatedCombos });
      }
    } catch (err) {
      console.error("Lỗi xác nhận combo:", err);
      const msg = err.response?.data?.message || err.response?.data || "Xác nhận thất bại.";
      setErrorMsg(typeof msg === 'string' ? msg : "Thất bại khi xác nhận giao combo.");
    } finally {
      setConfirmingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="staff-combo-page">
      <Header />

      <main className="staff-combo-container">
        {/* Page Title & Search Header */}
        <div className="staff-combo-header">
          <div className="staff-badge">
            <span>🛡️ STAFF PORTAL</span>
          </div>
          <h1>5.1. Xác Nhận Khách Nhận Combo</h1>
          <p>Tra cứu combo theo mã Booking hoặc mã Vé để giao cho khách hàng tại rạp</p>

          <form className="staff-search-box" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Nhập mã Booking (VD: 1001) hoặc Mã vé..."
                value={bookingCodeInput}
                onChange={(e) => setBookingCodeInput(e.target.value)}
              />
              {bookingCodeInput && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setBookingCodeInput("")}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="search-btn"
              disabled={loading || !bookingCodeInput.trim()}
            >
              {loading ? "Đang tìm..." : "Tra cứu"}
            </button>
          </form>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="staff-alert error">
            <span className="alert-icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="staff-alert success">
            <span className="alert-icon">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Order Details Display */}
        {order && (
          <div className="staff-order-card">
            {/* Booking Top Info */}
            <div className="order-info-header">
              <div className="order-main-title">
                <span className="booking-tag">BK-{order.bookingId}</span>
                <h2>{order.movieTitle}</h2>
              </div>
              <div className={`status-pill ${order.bookingStatus.toLowerCase()}`}>
                {order.bookingStatus === "CONFIRMED" ? "Đã thanh toán" : order.bookingStatus}
              </div>
            </div>

            <div className="order-details-grid">
              <div className="detail-item">
                <span className="detail-label">👤 Khách hàng</span>
                <span className="detail-value">{order.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📞 Điện thoại</span>
                <span className="detail-value">{order.customerPhone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🏢 Rạp chiếu</span>
                <span className="detail-value">{order.cinemaName} ({order.roomName})</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🕒 Suất chiếu</span>
                <span className="detail-value">{formatDateTime(order.showtimeStart)}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">💺 Ghế ngồi</span>
                <div className="seat-tags">
                  {order.seatLabels && order.seatLabels.length > 0 ? (
                    order.seatLabels.map((s) => (
                      <span key={s} className="seat-chip">{s}</span>
                    ))
                  ) : (
                    <span className="no-seats">Chưa phân ghế</span>
                  )}
                </div>
              </div>
            </div>

            {/* Combo Items Section */}
            <div className="combos-section">
              <h3>🍿 Danh Sách Combo Cần Giao</h3>

              {(!order.combos || order.combos.length === 0) ? (
                <div className="no-combos">
                  <span>ℹ️ Booking này không mua kèm Combo nào.</span>
                </div>
              ) : (
                <div className="combos-list">
                  {order.combos.map((c) => (
                    <div key={c.id} className="combo-item-card">
                      <div className="combo-img-container">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.comboName} />
                        ) : (
                          <span className="combo-placeholder-icon">🍿</span>
                        )}
                      </div>

                      <div className="combo-details">
                        <h4>{c.comboName}</h4>
                        <p className="combo-desc">{c.description}</p>
                        <div className="combo-meta">
                          <span className="combo-qty">Số lượng: <strong>x{c.quantity}</strong></span>
                          <span className="combo-price">{formatCurrency(c.price * c.quantity)}</span>
                        </div>

                        {c.fulfillmentStatus === "RECEIVED" && (
                          <div className="fulfillment-audit-info">
                            <span>✅ Đã giao vào {formatDateTime(c.receivedAt)}</span>
                            {c.confirmedByStaffName && (
                              <span className="staff-name-audit"> (Nhân viên: {c.confirmedByStaffName})</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="combo-actions">
                        {c.fulfillmentStatus === "PAID_NOT_RECEIVED" ? (
                          <button
                            className="btn-confirm-receive"
                            onClick={() => handleConfirmReceive(c.id)}
                            disabled={confirmingId === c.id}
                          >
                            {confirmingId === c.id ? "Đang xử lý..." : "🍿 Xác nhận đã giao"}
                          </button>
                        ) : c.fulfillmentStatus === "RECEIVED" ? (
                          <span className="badge-received">🟢 ĐÃ GIAO</span>
                        ) : c.fulfillmentStatus === "CANCELLED" ? (
                          <span className="badge-cancelled">🔴 ĐÃ HỦY</span>
                        ) : (
                          <span className="badge-unpaid">⚪ CHƯA THANH TOÁN</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
