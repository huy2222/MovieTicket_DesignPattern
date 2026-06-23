import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminCinemas } from "../../services/cinemaAdminService";
import { getAdminMovies } from "../../services/movieAdminService";
import { getAdminRooms } from "../../services/roomAdminService";
import {
  createAdminShowtime,
  deleteAdminShowtime,
  getAdminShowtimes,
  updateAdminShowtime,
} from "../../services/showtimeAdminService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./ShowtimeManagementPage.css";

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Đang mở bán" },
  { value: "SOLD_OUT", label: "Hết vé" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FINISHED", label: "Đã chiếu" },
];

const STATUS_LABELS = STATUS_OPTIONS.reduce((labels, option) => {
  labels[option.value] = option.label;
  return labels;
}, {});

const emptyForm = {
  movieId: "",
  cinemaId: "",
  roomId: "",
  startTime: "",
  basePrice: 85000,
  status: "AVAILABLE",
};

function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function toDateTimeInputValue(value) {
  if (!value) return "";
  return value.slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function ShowtimeManagementPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    movieId: "ALL",
    cinemaId: "ALL",
    roomId: "ALL",
    date: toDateInputValue(),
    status: "ALL",
  });
  const [form, setForm] = useState(emptyForm);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [cinemaResponse, roomResponse, movieResponse] = await Promise.all([
        getAdminCinemas(),
        getAdminRooms(),
        getAdminMovies({ page: 0, size: 200, sortDirection: "desc" }),
      ]);

      const cinemaList = cinemaResponse.data || [];
      const roomList = roomResponse.data || [];
      const movieList = movieResponse.data?.content || [];

      setCinemas(cinemaList);
      setRooms(roomList);
      setMovies(movieList.filter((movie) => movie.status !== "ENDED"));
      setForm((current) => ({
        ...current,
        cinemaId: current.cinemaId || cinemaList[0]?.id || "",
      }));
    } catch (err) {
      console.error("Không thể tải dữ liệu nền cho lịch chiếu:", err);
      showToast("Không thể tải dữ liệu phim, rạp hoặc phòng", "error");
    }
  }, [showToast]);

  const fetchShowtimes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.movieId !== "ALL") params.movieId = filters.movieId;
      if (filters.cinemaId !== "ALL") params.cinemaId = filters.cinemaId;
      if (filters.roomId !== "ALL") params.roomId = filters.roomId;
      if (filters.date) params.date = filters.date;
      if (filters.status !== "ALL") params.status = filters.status;

      const response = await getAdminShowtimes(params);
      setShowtimes(response.data || []);
    } catch (err) {
      console.error("Không thể tải danh sách lịch chiếu:", err);
      showToast("Không thể tải danh sách lịch chiếu", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  const formRooms = useMemo(() => {
    if (!form.cinemaId) return rooms;
    return rooms.filter((room) => Number(room.cinemaId) === Number(form.cinemaId));
  }, [form.cinemaId, rooms]);

  const filterRooms = useMemo(() => {
    if (filters.cinemaId === "ALL") return rooms;
    return rooms.filter((room) => Number(room.cinemaId) === Number(filters.cinemaId));
  }, [filters.cinemaId, rooms]);

  const selectedMovie = useMemo(
    () => movies.find((movie) => Number(movie.id) === Number(form.movieId)),
    [form.movieId, movies]
  );

  const previewEndTime = useMemo(() => {
    if (!form.startTime || !selectedMovie?.duration) return "";
    const endTime = new Date(form.startTime);
    endTime.setMinutes(endTime.getMinutes() + selectedMovie.duration);
    return formatDateTime(endTime.toISOString());
  }, [form.startTime, selectedMovie]);

  const stats = useMemo(
    () => ({
      total: showtimes.length,
      available: showtimes.filter((item) => item.status === "AVAILABLE").length,
      soldOut: showtimes.filter((item) => item.status === "SOLD_OUT").length,
      cancelled: showtimes.filter((item) => item.status === "CANCELLED").length,
    }),
    [showtimes]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "cinemaId" ? { roomId: "ALL" } : {}),
    }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "cinemaId" ? { roomId: "" } : {}),
    }));
  };

  const openCreateModal = () => {
    setEditingShowtime(null);
    setForm({
      ...emptyForm,
      cinemaId: filters.cinemaId !== "ALL" ? filters.cinemaId : cinemas[0]?.id || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (showtime) => {
    setEditingShowtime(showtime);
    setForm({
      movieId: showtime.movieId || "",
      cinemaId: showtime.cinemaId || "",
      roomId: showtime.roomId || "",
      startTime: toDateTimeInputValue(showtime.startTime),
      basePrice: showtime.basePrice || 85000,
      status: showtime.status || "AVAILABLE",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingShowtime(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      movieId: Number(form.movieId),
      cinemaId: Number(form.cinemaId),
      roomId: Number(form.roomId),
      startTime: form.startTime,
      basePrice: Number(form.basePrice),
      status: form.status,
    };

    try {
      if (editingShowtime) {
        await updateAdminShowtime(editingShowtime.id, payload);
        showToast("Cập nhật lịch chiếu thành công");
      } else {
        await createAdminShowtime(payload);
        showToast("Tạo lịch chiếu thành công");
      }
      closeModal();
      fetchShowtimes();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể lưu lịch chiếu"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (showtime) => {
    const message = showtime.locked
      ? "Lịch chiếu đã có dữ liệu đặt vé. Hệ thống sẽ chuyển sang trạng thái Đã hủy."
      : `Bạn có chắc muốn xóa lịch chiếu "${showtime.movieTitle}" lúc ${formatDateTime(showtime.startTime)}?`;

    if (!window.confirm(message)) return;

    try {
      await deleteAdminShowtime(showtime.id);
      showToast(showtime.locked ? "Đã hủy lịch chiếu" : "Xóa lịch chiếu thành công");
      fetchShowtimes();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể xóa lịch chiếu"), "error");
    }
  };

  return (
    <div className="showtime-management-page">
      {toast && <div className={`showtime-toast ${toast.type}`}>{toast.message}</div>}

      <div className="showtime-page-header">
        <h1 className="showtime-page-title">
          <span className="showtime-page-title-icon">◴</span>
          Quản lý Lịch chiếu
        </h1>
        <button className="btn-create-showtime" onClick={openCreateModal}>
          + Thêm lịch chiếu
        </button>
      </div>

      <div className="showtime-stats">
        <div className="showtime-stat">
          <span>{stats.total}</span>
          <p>Tổng suất</p>
        </div>
        <div className="showtime-stat">
          <span>{stats.available}</span>
          <p>Đang mở bán</p>
        </div>
        <div className="showtime-stat">
          <span>{stats.soldOut}</span>
          <p>Hết vé</p>
        </div>
        <div className="showtime-stat">
          <span>{stats.cancelled}</span>
          <p>Đã hủy</p>
        </div>
      </div>

      <div className="showtime-toolbar">
        <select name="cinemaId" value={filters.cinemaId} onChange={handleFilterChange}>
          <option value="ALL">Tất cả rạp</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>
        <select name="roomId" value={filters.roomId} onChange={handleFilterChange}>
          <option value="ALL">Tất cả phòng</option>
          {filterRooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.roomCode} - {room.name}
            </option>
          ))}
        </select>
        <select name="movieId" value={filters.movieId} onChange={handleFilterChange}>
          <option value="ALL">Tất cả phim</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="ALL">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="showtime-loading">
          <div className="showtime-loading-spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="showtime-empty">
          <div className="showtime-empty-icon">◴</div>
          <h3>Chưa có lịch chiếu</h3>
          <p>Chọn ngày khác hoặc thêm lịch chiếu mới cho phim đang phát hành.</p>
        </div>
      ) : (
        <div className="showtime-table-wrapper">
          <table className="showtime-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Phòng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Giá vé</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => (
                <tr key={showtime.id}>
                  <td>
                    <strong>{showtime.movieTitle}</strong>
                    <small>{showtime.movieDuration} phút</small>
                  </td>
                  <td>{showtime.cinemaName}</td>
                  <td>
                    <strong>{showtime.roomCode}</strong>
                    <small>{showtime.roomName}</small>
                  </td>
                  <td>{formatDateTime(showtime.startTime)}</td>
                  <td>{formatDateTime(showtime.endTime)}</td>
                  <td>{formatCurrency(showtime.basePrice)}</td>
                  <td>
                    <span className={`showtime-status ${showtime.status?.toLowerCase()}`}>
                      {STATUS_LABELS[showtime.status] || showtime.status}
                    </span>
                  </td>
                  <td>
                    <div className="showtime-actions">
                      <button className="btn-showtime-action edit" onClick={() => openEditModal(showtime)}>
                        Sửa
                      </button>
                      <button className="btn-showtime-action delete" onClick={() => handleDelete(showtime)}>
                        {showtime.locked ? "Hủy" : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="showtime-modal-overlay" onClick={closeModal}>
          <div className="showtime-modal" onClick={(event) => event.stopPropagation()}>
            <div className="showtime-modal-header">
              <h2>{editingShowtime ? "Sửa lịch chiếu" : "Thêm lịch chiếu"}</h2>
              <button type="button" className="showtime-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form className="showtime-modal-form" onSubmit={handleSubmit}>
              {editingShowtime?.locked && (
                <div className="showtime-form-note">
                  Lịch chiếu đã có dữ liệu đặt vé, chỉ nên cập nhật giá vé hoặc trạng thái.
                </div>
              )}

              <label>
                Phim *
                <select
                  name="movieId"
                  value={form.movieId}
                  onChange={handleFormChange}
                  disabled={editingShowtime?.locked}
                  required
                >
                  <option value="">Chọn phim</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
              </label>

              <div className="showtime-form-grid">
                <label>
                  Rạp *
                  <select
                    name="cinemaId"
                    value={form.cinemaId}
                    onChange={handleFormChange}
                    disabled={editingShowtime?.locked}
                    required
                  >
                    <option value="">Chọn rạp</option>
                    {cinemas.map((cinema) => (
                      <option key={cinema.id} value={cinema.id}>
                        {cinema.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Phòng *
                  <select
                    name="roomId"
                    value={form.roomId}
                    onChange={handleFormChange}
                    disabled={editingShowtime?.locked}
                    required
                  >
                    <option value="">Chọn phòng</option>
                    {formRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomCode} - {room.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="showtime-form-grid">
                <label>
                  Giờ bắt đầu *
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleFormChange}
                    disabled={editingShowtime?.locked}
                    required
                  />
                </label>

                <label>
                  Giá vé cơ bản *
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>

              <div className="showtime-form-grid">
                <label>
                  Trạng thái
                  <select name="status" value={form.status} onChange={handleFormChange}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="showtime-end-preview">
                  <span>Kết thúc dự kiến</span>
                  <strong>{previewEndTime || "Chọn phim và giờ bắt đầu"}</strong>
                </div>
              </div>

              <div className="showtime-modal-actions">
                <button type="button" className="btn-showtime-cancel" onClick={closeModal}>
                  Hủy
                </button>
                <button className="btn-showtime-submit" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : editingShowtime ? "Lưu thay đổi" : "Tạo lịch chiếu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
