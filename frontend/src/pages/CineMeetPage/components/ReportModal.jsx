import { useEffect, useState } from "react";
import { createCineMeetReport } from "../../../services/cinemeetService";
import { getApiErrorMessage } from "../../../utils/apiError";

const REPORT_REASONS = [
  { value: "HARASSMENT", label: "Quấy rối hoặc bắt nạt" },
  { value: "INAPPROPRIATE_CONTENT", label: "Nội dung không phù hợp" },
  { value: "SPAM", label: "Spam hoặc làm phiền" },
  { value: "FAKE_PROFILE", label: "Hồ sơ giả mạo" },
  { value: "SCAM", label: "Lừa đảo" },
  { value: "HATE_SPEECH", label: "Ngôn từ thù ghét" },
  { value: "OTHER", label: "Lý do khác" },
];

export default function ReportModal({ target, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, submitting]);

  if (!target) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reason) {
      setError("Vui lòng chọn lý do báo cáo");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await createCineMeetReport({
        reportedUserId: target.type === "USER" ? target.userId : null,
        messageId: target.type === "MESSAGE" ? target.messageId : null,
        reason,
        description: description.trim() || null,
      });
      onSuccess?.("Gửi báo cáo thành công. Người dùng đã được ẩn khỏi CineMeet của bạn.", data);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gửi báo cáo thất bại. Vui lòng thử lại sau."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-backdrop" onMouseDown={submitting ? undefined : onClose}>
      <form className="report-modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="report-modal-heading">
          <div className="report-modal-icon" aria-hidden="true">!</div>
          <div>
            <p className="report-modal-eyebrow">CineMeet Safety</p>
            <h2>Báo cáo {target.type === "MESSAGE" ? "tin nhắn" : "người dùng"}</h2>
          </div>
          <button type="button" className="report-modal-close" onClick={onClose} disabled={submitting} aria-label="Đóng">×</button>
        </div>

        <div className="report-target-preview">
          <span className="report-target-label">Đối tượng báo cáo</span>
          <strong>{target.userName || "Người dùng CineMeet"}</strong>
          {target.type === "MESSAGE" ? (
            <blockquote>“{target.messageContent || "Tin nhắn đã chọn"}”</blockquote>
          ) : (
            <p>Hồ sơ người dùng CineMeet</p>
          )}
        </div>

        <label className="report-field">
          <span>Lý do báo cáo <em>*</em></span>
          <select value={reason} onChange={(event) => setReason(event.target.value)} autoFocus>
            <option value="">Chọn lý do phù hợp</option>
            {REPORT_REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="report-field">
          <span>Mô tả thêm <small>({description.length}/1000)</small></span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Cung cấp thêm thông tin để quản trị viên xem xét..."
          />
        </label>

        <p className="report-privacy-note">Báo cáo được bảo mật. Người bị báo cáo sẽ không biết danh tính của bạn.</p>
        {error ? <div className="report-modal-error" role="alert">{error}</div> : null}

        <div className="report-modal-actions">
          <button type="button" className="report-button-secondary" onClick={onClose} disabled={submitting}>Hủy</button>
          <button type="submit" className="report-button-danger" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </form>
    </div>
  );
}
