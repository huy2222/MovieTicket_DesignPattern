import "./VoucherCard.css";

// ============================================
// Helpers
// ============================================
const STATUS_LABELS = {
  DRAFT: "Khóa",
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Khóa",
  EXPIRED: "Hết hạn",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ============================================
// Component
// ============================================
export default function VoucherCard({
  voucher,
  onEdit,
  onActivate,
  onSuspend,
}) {
  const usagePercent = voucher.usageLimit
    ? Math.min(((voucher.usedCount || 0) / voucher.usageLimit) * 100, 100)
    : 0;

  return (
    <div className={`voucher-card ${voucher.status?.toLowerCase() || ""}`}>
      {/* Header */}
      <div className="voucher-card-header">
        <div className="voucher-card-code">
          <span className="voucher-card-code-icon">🎫</span>
          {voucher.code}
        </div>
        <span className={`status-badge ${voucher.status?.toLowerCase() || ""}`}>
          {STATUS_LABELS[voucher.status] || voucher.status}
        </span>
      </div>

      {/* Body */}
      <div className="voucher-card-name">{voucher.name}</div>
      <div className="voucher-card-desc">
        {voucher.decoratorDescription || voucher.description || "Không có mô tả"}
      </div>

      {/* Info */}
      <div className="voucher-card-info">
        <div className="voucher-card-info-row">
          <span className="voucher-card-info-label">Thời hạn</span>
          <span className="voucher-card-info-value">
            {formatDate(voucher.startTime)} → {formatDate(voucher.endTime)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="voucher-card-progress">
        <div className="voucher-card-progress-header">
          <span className="voucher-card-progress-label">Đã sử dụng</span>
          <span className="voucher-card-progress-value">
            {voucher.usedCount || 0}/{voucher.usageLimit || "∞"} lượt
          </span>
        </div>
        <div className="voucher-card-progress-bar">
          <div
            className="voucher-card-progress-fill"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Separator */}
      <hr className="voucher-card-separator" />

      {/* Actions */}
      <div className="voucher-card-actions">
        {(voucher.status === "DRAFT" || voucher.status === "SUSPENDED") && onEdit && (
          <button
            className="btn-action edit"
            onClick={() => onEdit(voucher)}
          >
            ✏️ Sửa
          </button>
        )}

        {(voucher.status === "DRAFT" || voucher.status === "SUSPENDED") &&
          onActivate && (
            <button
              className="btn-action activate"
              onClick={() => onActivate(voucher.id)}
            >
              ▶ Kích hoạt
            </button>
          )}

        {voucher.status === "ACTIVE" && onSuspend && (
          <button
            className="btn-action suspend"
            onClick={() => onSuspend(voucher.id)}
          >
            ⏸ Ngưng
          </button>
        )}
      </div>
    </div>
  );
}
