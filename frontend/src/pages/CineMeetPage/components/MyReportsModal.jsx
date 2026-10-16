import { useEffect } from "react";

const STATUS_META = {
  PENDING: { label: "Chờ xử lý", detail: "Báo cáo đã được ghi nhận và đang chờ quản trị viên tiếp nhận." },
  REVIEWING: { label: "Đang xem xét", detail: "Quản trị viên đang kiểm tra bằng chứng và nội dung liên quan." },
  RESOLVED: { label: "Đã xác nhận vi phạm", detail: "Báo cáo đã được xác nhận là có vi phạm." },
  REJECTED: { label: "Đã từ chối", detail: "Báo cáo chưa đủ căn cứ hoặc không xác định được vi phạm." },
};

const REASON_LABELS = {
  HARASSMENT: "Quấy rối hoặc bắt nạt",
  INAPPROPRIATE_CONTENT: "Nội dung không phù hợp",
  SPAM: "Spam hoặc làm phiền",
  FAKE_PROFILE: "Hồ sơ giả mạo",
  SCAM: "Lừa đảo",
  HATE_SPEECH: "Ngôn từ thù ghét",
  OTHER: "Lý do khác",
};

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
    })
  : "";

export default function MyReportsModal({ reports, loading, error, onClose, onRefresh }) {
  useEffect(() => {
    const handleEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="report-modal-backdrop" onMouseDown={onClose}>
      <section className="my-reports-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="my-reports-header">
          <div>
            <p className="report-modal-eyebrow">CineMeet Safety</p>
            <h2>Báo cáo của tôi</h2>
            <p>Theo dõi tiến độ các báo cáo bạn đã gửi.</p>
          </div>
          <div className="my-reports-header-actions">
            <button type="button" onClick={onRefresh} disabled={loading}>↻</button>
            <button type="button" onClick={onClose} aria-label="Đóng">×</button>
          </div>
        </header>

        <div className="my-reports-list cinemeet-scroll">
          {loading ? <div className="my-reports-empty">Đang tải trạng thái báo cáo...</div> : null}
          {!loading && error ? <div className="report-modal-error">{error}</div> : null}
          {!loading && !error && reports.length === 0 ? (
            <div className="my-reports-empty"><strong>Chưa có báo cáo nào</strong><span>Các báo cáo đã gửi sẽ xuất hiện tại đây.</span></div>
          ) : null}
          {!loading && !error ? reports.map((report) => {
            const status = STATUS_META[report.status] || { label: report.status, detail: "" };
            return (
              <article className="my-report-card" key={report.id}>
                <div className="my-report-card-top">
                  <div className="my-report-user">
                    <span>{report.reportedUserName?.charAt(0)?.toUpperCase() || "U"}</span>
                    <div><strong>{report.reportedUserName}</strong><small>#{report.id} · {formatDateTime(report.createdAt)}</small></div>
                  </div>
                  <span className={`my-report-status is-${report.status?.toLowerCase()}`}>{status.label}</span>
                </div>
                <div className="my-report-reason"><span>Lý do</span><strong>{REASON_LABELS[report.reason] || report.reason}</strong></div>
                {report.targetType === "MESSAGE" && report.messageContent ? <blockquote>“{report.messageContent}”</blockquote> : null}
                <p className="my-report-progress">{status.detail}</p>
                {report.resolutionNote ? <div className="my-report-result"><span>Kết quả từ quản trị viên</span><p>{report.resolutionNote}</p></div> : null}
              </article>
            );
          }) : null}
        </div>
      </section>
    </div>
  );
}
