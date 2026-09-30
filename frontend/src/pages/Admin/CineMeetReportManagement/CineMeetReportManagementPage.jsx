import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCineMeetReports,
  getCineMeetReport,
  resolveCineMeetReport,
  startCineMeetReportReview,
} from "../../../services/cineMeetReportAdminService";
import { getApiErrorMessage } from "../../../utils/apiError";
import "./CineMeetReportManagementPage.css";

const STATUS_META = {
  PENDING: { label: "Chờ xử lý", icon: "●" },
  REVIEWING: { label: "Đang xem xét", icon: "◐" },
  RESOLVED: { label: "Đã xác nhận", icon: "✓" },
  REJECTED: { label: "Đã từ chối", icon: "×" },
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
  : "—";

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, icon: "●" };
  return <span className={`cmr-status cmr-status--${status?.toLowerCase()}`}>{meta.icon} {meta.label}</span>;
}

export default function CineMeetReportManagementPage() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getCineMeetReports();
      setReports(data ?? []);
      setSelected((current) => current
        ? (data ?? []).find((item) => item.id === current.id) ?? null
        : null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được danh sách báo cáo."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadReports, 0);
    return () => window.clearTimeout(timer);
  }, [loadReports]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return reports.filter((report) => {
      if (status !== "ALL" && report.status !== status) return false;
      if (!keyword) return true;
      return [
        report.id,
        report.reporterName,
        report.reporterEmail,
        report.reportedUserName,
        report.reportedUserEmail,
        REASON_LABELS[report.reason],
      ].some((value) => String(value ?? "").toLocaleLowerCase("vi").includes(keyword));
    });
  }, [reports, search, status]);

  const counts = useMemo(() => reports.reduce((result, report) => {
    result[report.status] = (result[report.status] || 0) + 1;
    return result;
  }, {}), [reports]);

  const runUpdate = async (operation, successMessage) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await operation();
      setReports((current) => current.map((item) => item.id === data.id ? data : item));
      setSelected(data);
      setNote("");
      setToast({ type: "success", message: successMessage });
    } catch (err) {
      const message = getApiErrorMessage(err, "Cập nhật báo cáo thất bại. Vui lòng thử lại sau.");
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = (resultStatus) => {
    if (!note.trim()) {
      setError("Vui lòng nhập ghi chú xử lý trước khi xác nhận.");
      return;
    }
    runUpdate(
      () => resolveCineMeetReport(selected.id, resultStatus, note.trim()),
      "Xử lý báo cáo thành công",
    );
  };

  const openReport = async (report) => {
    setSelected(report);
    setNote("");
    setError("");
    setDetailLoading(true);
    try {
      const { data } = await getCineMeetReport(report.id);
      setSelected(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tìm thấy báo cáo"));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="cmr-page">
      {toast ? <div className={`cmr-toast cmr-toast--${toast.type}`}>{toast.message}</div> : null}

      <header className="cmr-header">
        <div>
          <p className="cmr-kicker">CineMeet Safety Center</p>
          <h1>Quản lý báo cáo</h1>
          <p>Tiếp nhận, xác minh và xử lý các báo cáo từ cộng đồng CineMeet.</p>
        </div>
        <button type="button" className="cmr-refresh" onClick={loadReports} disabled={loading}>↻ Làm mới</button>
      </header>

      <section className="cmr-stats" aria-label="Tổng quan báo cáo">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button key={key} type="button" className={`cmr-stat cmr-stat--${key.toLowerCase()}`} onClick={() => setStatus(key)}>
            <span>{meta.label}</span>
            <strong>{counts[key] || 0}</strong>
          </button>
        ))}
      </section>

      <section className="cmr-workspace">
        <div className="cmr-list-panel">
          <div className="cmr-toolbar">
            <label className="cmr-search">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm ID, người báo cáo, người bị báo cáo..." />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(STATUS_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
          </div>

          {error && !selected ? <div className="cmr-page-error">{error}</div> : null}
          {loading ? (
            <div className="cmr-empty"><span className="cmr-spinner" /><p>Đang tải dữ liệu báo cáo...</p></div>
          ) : filteredReports.length === 0 ? (
            <div className="cmr-empty"><span className="cmr-empty-icon">◎</span><h3>Không có dữ liệu báo cáo</h3><p>Chưa có báo cáo phù hợp với bộ lọc hiện tại.</p></div>
          ) : (
            <div className="cmr-table-wrap">
              <table className="cmr-table">
                <thead><tr><th>Mã</th><th>Đối tượng</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className={selected?.id === report.id ? "is-selected" : ""} onClick={() => openReport(report)}>
                      <td><span className="cmr-id">#{report.id}</span></td>
                      <td>
                        <div className="cmr-user-cell">
                          <span className="cmr-avatar">{report.reportedUserName?.charAt(0)?.toUpperCase() || "U"}</span>
                          <div><strong>{report.reportedUserName}</strong><small>{report.targetType === "MESSAGE" ? `Tin nhắn #${report.messageId}` : "Hồ sơ người dùng"}</small></div>
                        </div>
                      </td>
                      <td>{REASON_LABELS[report.reason] || report.reason}</td>
                      <td><span className="cmr-date">{formatDateTime(report.createdAt)}</span></td>
                      <td><StatusBadge status={report.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className={`cmr-detail ${selected ? "is-open" : ""}`}>
          {!selected ? (
            <div className="cmr-detail-placeholder"><span>◫</span><h3>Chọn một báo cáo</h3><p>Thông tin chi tiết và thao tác xử lý sẽ xuất hiện tại đây.</p></div>
          ) : (
            <>
              <div className="cmr-detail-header">
                <div><p>Báo cáo #{selected.id}</p><StatusBadge status={selected.status} /></div>
                <button type="button" onClick={() => setSelected(null)} aria-label="Đóng chi tiết">×</button>
              </div>

              <div className="cmr-detail-scroll">
                {detailLoading ? <div className="cmr-detail-loading">Đang tải bằng chứng...</div> : null}
                <section className="cmr-detail-section">
                  <h3>Thông tin báo cáo</h3>
                  <dl>
                    <div><dt>Người báo cáo</dt><dd>{selected.reporterName}<small>{selected.reporterEmail}</small></dd></div>
                    <div><dt>Người bị báo cáo</dt><dd>{selected.reportedUserName}<small>{selected.reportedUserEmail}</small></dd></div>
                    <div><dt>Lý do</dt><dd>{REASON_LABELS[selected.reason] || selected.reason}</dd></div>
                    <div><dt>Thời gian tạo</dt><dd>{formatDateTime(selected.createdAt)}</dd></div>
                  </dl>
                </section>

                <section className="cmr-detail-section">
                  <h3>Snapshot hồ sơ khi báo cáo</h3>
                  <div className="cmr-profile-evidence">
                    <div className="cmr-evidence-avatar">
                      {selected.reportedUserAvatar ? <img src={selected.reportedUserAvatar} alt="" /> : selected.reportedUserName?.charAt(0)}
                    </div>
                    <div>
                      <strong>{selected.reportedUserName}{selected.reportedUserAge ? `, ${selected.reportedUserAge}` : ""}</strong>
                      <p>{selected.reportedUserBio || "Hồ sơ không có phần giới thiệu."}</p>
                    </div>
                  </div>
                </section>

                {selected.targetType === "MESSAGE" ? (
                  <section className="cmr-detail-section">
                    <h3>Nội dung bị báo cáo</h3>
                    <div className="cmr-message-evidence"><span>Tin nhắn #{selected.messageId} · Match #{selected.matchId}</span><p>“{selected.messageContent}”</p><small>{formatDateTime(selected.messageSentAt)}</small></div>
                    {selected.evidenceMessages?.length > 0 ? (
                      <div className="cmr-context-evidence">
                        <h4>Ngữ cảnh cuộc trò chuyện</h4>
                        {selected.evidenceMessages.map((message) => (
                          <div key={message.id} className={message.reportedMessage ? "is-reported" : ""}>
                            <span>{message.senderName}</span>
                            <p>{message.content}</p>
                            <small>{formatDateTime(message.sentAt)}{message.reportedMessage ? " · Tin nhắn bị báo cáo" : ""}</small>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <section className="cmr-detail-section">
                  <h3>Mô tả từ người báo cáo</h3>
                  <p className="cmr-description">{selected.description || "Người báo cáo không cung cấp mô tả bổ sung."}</p>
                </section>

                {selected.reviewedByName ? (
                  <section className="cmr-audit">
                    <span>Người xử lý: <strong>{selected.reviewedByName}</strong></span>
                    <span>Tiếp nhận: {formatDateTime(selected.reviewStartedAt)}</span>
                    {selected.resolvedAt ? <span>Hoàn tất: {formatDateTime(selected.resolvedAt)}</span> : null}
                  </section>
                ) : null}

                {selected.status === "PENDING" ? (
                  <button type="button" className="cmr-primary-action" disabled={busy} onClick={() => runUpdate(() => startCineMeetReportReview(selected.id), "Đã tiếp nhận báo cáo")}>{busy ? "Đang cập nhật..." : "Tiếp nhận xử lý"}</button>
                ) : null}

                {selected.status === "REVIEWING" ? (
                  <section className="cmr-resolution-box">
                    <label><span>Ghi chú xử lý <em>*</em></span><textarea rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi lại căn cứ và kết quả xác minh..." /></label>
                    {error ? <div className="cmr-inline-error">{error}</div> : null}
                    <div className="cmr-resolution-actions">
                      <button type="button" className="cmr-reject" disabled={busy} onClick={() => handleResolve("REJECTED")}>Từ chối báo cáo</button>
                      <button type="button" className="cmr-resolve" disabled={busy} onClick={() => handleResolve("RESOLVED")}>Xác nhận vi phạm</button>
                    </div>
                  </section>
                ) : null}

                {["RESOLVED", "REJECTED"].includes(selected.status) ? (
                  <section className="cmr-result"><span>Kết quả xử lý</span><p>{selected.resolutionNote}</p></section>
                ) : null}
              </div>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
