import { useEffect, useMemo, useState } from "react";
import {
  createAdminCinema,
  deleteAdminCinema,
  getAdminCinemas,
  updateAdminCinema,
} from "../../services/cinemaAdminService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./AdminCinemaPage.css";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "CLOSED", label: "Đã đóng" },
];

const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  MAINTENANCE: "Bảo trì",
  CLOSED: "Đã đóng",
};

const emptyForm = {
  name: "",
  phoneNumber: "",
  area: "",
  address: "",
  status: "ACTIVE",
};

export default function AdminCinemaPage() {
  const [cinemas, setCinemas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCinema, setEditingCinema] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCinemas();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const response = await getAdminCinemas();
      setCinemas(response.data || []);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể tải danh sách rạp chiếu"), "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCinemas = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return cinemas.filter((cinema) => {
      const matchesSearch =
        !keyword ||
        [cinema.name, cinema.area, cinema.address, cinema.phoneNumber, cinema.status]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || cinema.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cinemas, query, statusFilter]);

  const activeCount = cinemas.filter((cinema) => cinema.status === "ACTIVE").length;
  const maintenanceCount = cinemas.filter((cinema) => cinema.status === "MAINTENANCE").length;
  const closedCount = cinemas.filter((cinema) => cinema.status === "CLOSED").length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingCinema) {
        const response = await updateAdminCinema(editingCinema.id, form);
        setCinemas((current) =>
          current.map((cinema) =>
            cinema.id === editingCinema.id ? response.data : cinema
          )
        );
        showToast("Cập nhật rạp chiếu thành công");
      } else {
        const response = await createAdminCinema(form);
        setCinemas((current) => [...current, response.data]);
        showToast("Thêm rạp chiếu thành công");
      }

      handleReset();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể lưu rạp chiếu"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cinema) => {
    setEditingCinema(cinema);
    setForm({
      name: cinema.name || "",
      phoneNumber: cinema.phoneNumber || "",
      area: cinema.area || "",
      address: cinema.address || "",
      status: cinema.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleDelete = async (cinema) => {
    if (!window.confirm(`Bạn có chắc muốn xóa rạp "${cinema.name}"?`)) return;

    try {
      await deleteAdminCinema(cinema.id);
      setCinemas((current) => current.filter((item) => item.id !== cinema.id));
      showToast("Xóa rạp chiếu thành công");

      if (editingCinema?.id === cinema.id) {
        handleReset();
      }
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể xóa rạp chiếu"), "error");
    }
  };

  const handleReset = () => {
    setEditingCinema(null);
    setForm(emptyForm);
    setModalOpen(false);
  };

  const handleCreate = () => {
    setEditingCinema(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  return (
    <div className="cinema-management-page">
      {toast && (
        <div className={`cinema-toast ${toast.type}`}>{toast.message}</div>
      )}

      <div className="cinema-page-header">
        <h1 className="cinema-page-title">
          <span className="cinema-page-title-icon">🏢</span>
          Quản lý Rạp chiếu
          <span className="cinema-count-badge">{cinemas.length} rạp</span>
        </h1>
        <button className="btn-create-cinema" onClick={handleCreate}>
          <span>＋</span> Thêm rạp
        </button>
      </div>

      <div className="cinema-summary-row">
        <div className="cinema-summary-item">
          <span>{cinemas.length}</span>
          <p>Tổng rạp</p>
        </div>
        <div className="cinema-summary-item">
          <span>{activeCount}</span>
          <p>Đang hoạt động</p>
        </div>
        <div className="cinema-summary-item">
          <span>{maintenanceCount}</span>
          <p>Bảo trì</p>
        </div>
        <div className="cinema-summary-item">
          <span>{closedCount}</span>
          <p>Đã đóng</p>
        </div>
      </div>

      <div className="cinema-toolbar">
        <div className="cinema-search">
          <span className="cinema-search-icon">🔍</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên rạp, khu vực, địa chỉ..."
          />
        </div>

        <select
          className="cinema-filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <section className="cinema-table-section">
        {loading ? (
          <div className="cinema-loading">
            <div className="cinema-loading-spinner" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredCinemas.length === 0 ? (
          <div className="cinema-empty">
            <div className="cinema-empty-icon">🏢</div>
            <h3>Chưa có rạp chiếu</h3>
            <p>Thêm rạp mới hoặc thay đổi bộ lọc để xem dữ liệu.</p>
          </div>
        ) : (
          <div className="cinema-table-wrapper">
            <table className="cinema-table">
              <thead>
                <tr>
                  <th>Tên rạp</th>
                  <th>Khu vực</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCinemas.map((cinema) => (
                  <tr key={cinema.id}>
                    <td>
                      <strong>{cinema.name}</strong>
                      <small>{cinema.address}</small>
                      <small>{cinema.phoneNumber}</small>
                    </td>
                    <td>{cinema.area}</td>
                    <td>
                      <span className={`cinema-status ${cinema.status?.toLowerCase()}`}>
                        {STATUS_LABELS[cinema.status] || cinema.status}
                      </span>
                    </td>
                    <td>
                      <div className="cinema-actions">
                        <button
                          type="button"
                          className="btn-cinema-action edit"
                          onClick={() => handleEdit(cinema)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-cinema-action delete"
                          onClick={() => handleDelete(cinema)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="cinema-modal-overlay" onClick={handleReset}>
          <div className="cinema-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cinema-modal-header">
              <h2>{editingCinema ? "Sửa rạp chiếu" : "Thêm rạp chiếu mới"}</h2>
              <button type="button" className="cinema-modal-close" onClick={handleReset}>
                ×
              </button>
            </div>

            <form className="cinema-modal-form" onSubmit={handleSubmit}>
              <div className="cinema-modal-section-title">Thông tin rạp</div>
              <div className="cinema-form-grid">
                <label>
                  Tên rạp *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="CineMax Trung tâm"
                    required
                  />
                </label>

                <label>
                  Số điện thoại *
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="028 0000 0000"
                    required
                  />
                </label>
              </div>

              <div className="cinema-form-grid">
                <label>
                  Khu vực *
                  <input
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="Quận 1"
                    required
                  />
                </label>

                <label>
                  Trạng thái
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Địa chỉ *
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Đường, phường, quận"
                  required
                />
              </label>

              <div className="cinema-modal-actions">
                <button type="button" className="btn-cinema-cancel" onClick={handleReset}>
                  Hủy
                </button>
                <button className="btn-cinema-submit" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : editingCinema ? "Lưu thay đổi" : "Thêm rạp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
