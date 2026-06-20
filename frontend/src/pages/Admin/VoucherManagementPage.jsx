import { useState, useEffect, useCallback } from "react";
import {
  getAllVouchers,
  activateVoucher,
  suspendVoucher,
  deleteVoucher,
} from "../../services/voucherService";
import VoucherFormModal from "../../components/voucher/VoucherFormModal";
import "./VoucherManagementPage.css";

// ============================================
// Helpers
// ============================================

const VOUCHER_TYPE_LABELS = {
  PERCENT_DISCOUNT: "Giảm %",
  BUY_N_GET_FREE: "Mua N tặng M",
  MIN_TICKET_DISCOUNT: "Mua N giảm %",
};

const VOUCHER_TYPE_CLASS = {
  PERCENT_DISCOUNT: "percent",
  BUY_N_GET_FREE: "buyfree",
  MIN_TICKET_DISCOUNT: "minticket",
};

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

export default function VoucherManagementPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  // ---- Fetch vouchers ----
  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllVouchers();
      setVouchers(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách voucher:", err);
      showToast("Không thể tải danh sách voucher", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // ---- Toast ----
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Actions ----
  const handleActivate = async (id) => {
    try {
      await activateVoucher(id);
      showToast("Kích hoạt voucher thành công!");
      fetchVouchers();
    } catch (err) {
      showToast("Lỗi khi kích hoạt voucher", "error");
    }
  };

  const handleSuspend = async (id) => {
    try {
      await suspendVoucher(id);
      showToast("Tạm ngưng voucher thành công!");
      fetchVouchers();
    } catch (err) {
      showToast("Lỗi khi tạm ngưng voucher", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá voucher này?")) return;
    try {
      await deleteVoucher(id);
      showToast("Xoá voucher thành công!");
      fetchVouchers();
    } catch (err) {
      showToast("Lỗi khi xoá voucher", "error");
    }
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingVoucher(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingVoucher(null);
  };

  const handleModalSuccess = (message) => {
    handleModalClose();
    showToast(message || "Thao tác thành công!");
    fetchVouchers();
  };

  // ---- Filter & Search ----
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      !search ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.code?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      v.status === statusFilter ||
      (statusFilter === "SUSPENDED" && v.status === "DRAFT");

    return matchesSearch && matchesStatus;
  });

  // ---- Render ----
  return (
    <div className="voucher-management-page">
      {/* Toast */}
      {toast && (
        <div className={`voucher-toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Header */}
      <div className="voucher-page-header">
        <h1 className="voucher-page-title">
          <span className="voucher-page-title-icon">🎫</span>
          Quản lý Khuyến mãi
          <span className="voucher-count-badge">{vouchers.length} voucher</span>
        </h1>
        <button className="btn-create-voucher" onClick={handleCreate}>
          <span>＋</span> Tạo Voucher
        </button>
      </div>

      {/* Toolbar */}
      <div className="voucher-toolbar">
        <div className="voucher-search">
          <span className="voucher-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã voucher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="voucher-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">🟢 Đang hoạt động</option>
          <option value="SUSPENDED">🔴 Khóa</option>
          <option value="EXPIRED">⚫ Hết hạn</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="voucher-loading">
          <div className="voucher-loading-spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="voucher-empty">
          <div className="voucher-empty-icon">🎫</div>
          <h3>Chưa có voucher nào</h3>
          <p>
            {search || statusFilter !== "ALL"
              ? "Không tìm thấy voucher phù hợp với bộ lọc."
              : 'Nhấn "Tạo Voucher" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <div className="voucher-table-wrapper">
          <table className="voucher-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mã</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Thời hạn</th>
                <th>Đã dùng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id}>
                  {/* Tên */}
                  <td>
                    <strong>{voucher.name}</strong>
                    {voucher.decoratorDescription && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: "0.15rem",
                        }}
                      >
                        {voucher.decoratorDescription}
                      </div>
                    )}
                  </td>

                  {/* Mã */}
                  <td>
                    <span className="voucher-code">{voucher.code}</span>
                  </td>

                  {/* Loại */}
                  <td>
                    <span
                      className={`voucher-type-badge ${
                        VOUCHER_TYPE_CLASS[voucher.voucherType] || ""
                      }`}
                    >
                      {VOUCHER_TYPE_LABELS[voucher.voucherType] ||
                        voucher.voucherType}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td>
                    <span
                      className={`status-badge ${
                        voucher.status?.toLowerCase() || ""
                      }`}
                    >
                      {STATUS_LABELS[voucher.status] || voucher.status}
                    </span>
                  </td>

                  {/* Thời hạn */}
                  <td>
                    <div className="voucher-date">
                      {formatDate(voucher.startTime)} →{" "}
                      {formatDate(voucher.endTime)}
                    </div>
                  </td>

                  {/* Đã dùng */}
                  <td>
                    <div className="voucher-usage">
                      <span className="voucher-usage-text">
                        {voucher.usedCount || 0}/{voucher.usageLimit || "∞"}
                      </span>
                      <div className="voucher-usage-bar">
                        <div
                          className="voucher-usage-fill"
                          style={{
                            width: voucher.usageLimit
                              ? `${Math.min(
                                  ((voucher.usedCount || 0) /
                                    voucher.usageLimit) *
                                    100,
                                  100
                                )}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Hành động */}
                  <td>
                    <div className="voucher-actions">
                      {/* Sửa — khi DRAFT hoặc SUSPENDED */}
                      {(voucher.status === "DRAFT" ||
                        voucher.status === "SUSPENDED") && (
                        <button
                          className="btn-action edit"
                          onClick={() => handleEdit(voucher)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                      )}

                      {/* Kích hoạt — khi DRAFT hoặc SUSPENDED */}
                      {(voucher.status === "DRAFT" ||
                        voucher.status === "SUSPENDED") && (
                        <button
                          className="btn-action activate"
                          onClick={() => handleActivate(voucher.id)}
                          title="Kích hoạt"
                        >
                          ▶ Kích hoạt
                        </button>
                      )}

                      {/* Tạm ngưng — khi ACTIVE */}
                      {voucher.status === "ACTIVE" && (
                        <button
                          className="btn-action suspend"
                          onClick={() => handleSuspend(voucher.id)}
                          title="Khóa hoạt động"
                        >
                          ⏸ Ngưng
                        </button>
                      )}

                      {/* Xoá — khi DRAFT hoặc SUSPENDED */}
                      {(voucher.status === "DRAFT" ||
                        voucher.status === "SUSPENDED") && (
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(voucher.id)}
                          title="Xoá"
                        >
                          🗑️
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

      {/* Modal */}
      {modalOpen && (
        <VoucherFormModal
          voucher={editingVoucher}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
