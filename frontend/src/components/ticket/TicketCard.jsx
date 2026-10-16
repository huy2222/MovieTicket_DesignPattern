import "./TicketCard.css";

const STATUS_LABELS = {
  CONFIRMED: "Đã xác nhận",
  PENDING: "Đang chờ",
  CANCELLED: "Đã huỷ",
  USED: "Đã sử dụng",
  EXPIRED: "Hết hạn",
};

function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN") + " VNĐ";
}

export default function TicketCard({ booking }) {
  const {
    movieTitle,
    posterUrl,
    showDate,
    showtime,
    cinemaName,
    roomName,
    seatLabels,
    status,
    totalAmount,
    ticketCount,
  } = booking;

  return (
    <div className="ticket-card" data-status={status}>
      {/* Poster */}
      <div className="ticket-poster">
        {posterUrl ? (
          <img src={posterUrl} alt={movieTitle} loading="lazy" />
        ) : (
          <span className="ticket-poster-placeholder">🎬</span>
        )}
      </div>

      {/* Info */}
      <div className="ticket-info">
        <h3 className="ticket-movie-title">{movieTitle}</h3>

        <div className="ticket-details-grid">
          <div className="ticket-detail-row">
            <span className="ticket-detail-icon">📅</span>
            <strong>{showDate}</strong>
            <span>•</span>
            <span>{showtime}</span>
          </div>

          <div className="ticket-detail-row">
            <span className="ticket-detail-icon">🏢</span>
            <strong>{cinemaName}</strong>
            <span>•</span>
            <span>{roomName}</span>
          </div>

          <div className="ticket-detail-row">
            <span className="ticket-detail-icon">💺</span>
            <span>Ghế:</span>
            <div className="ticket-seats">
              {seatLabels?.map((seat) => (
                <span key={seat} className="ticket-seat-tag">
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="ticket-detail-row">
            <span className="ticket-detail-icon">🎫</span>
            <span>{ticketCount} vé</span>
          </div>

          {booking.combos && booking.combos.length > 0 && (
            <div className="ticket-detail-row ticket-combos-row">
              <span className="ticket-detail-icon">🍿</span>
              <div className="ticket-combos-list">
                {booking.combos.map((c) => (
                  <div key={c.id} className="ticket-combo-item">
                    <span className="combo-name-qty">{c.comboName} (x{c.quantity})</span>
                    <span className={`combo-status-badge ${c.fulfillmentStatus?.toLowerCase()}`}>
                      {c.fulfillmentStatus === "RECEIVED"
                        ? "✅ Đã nhận"
                        : c.fulfillmentStatus === "PAID_NOT_RECEIVED"
                        ? "🟡 Chờ nhận tại rạp"
                        : c.fulfillmentStatus === "CANCELLED"
                        ? "🔴 Đã hủy"
                        : "⚪ Chưa thanh toán"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        <div className="ticket-footer">
          <span className={`ticket-status ${status.toLowerCase()}`}>
            {STATUS_LABELS[status] || status}
          </span>
          <span className="ticket-total">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
