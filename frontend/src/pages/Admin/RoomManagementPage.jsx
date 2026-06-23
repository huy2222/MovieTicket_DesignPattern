import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminCinemas } from "../../services/cinemaAdminService";
import {
  createAdminRoom,
  deleteAdminRoom,
  getAdminRooms,
  updateAdminRoom,
} from "../../services/roomAdminService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./RoomManagementPage.css";

const ROOM_TYPE_OPTIONS = [
  { value: "STANDARD_2D", label: "Tiêu chuẩn 2D" },
  { value: "PREMIUM_3D", label: "Cao cấp 3D" },
  { value: "IMAX", label: "IMAX" },
  { value: "COUPLE_ROOM", label: "Phòng đôi" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm ngưng" },
  { value: "MAINTENANCE", label: "Bảo trì" },
];

const SEAT_TYPE_LABELS = {
  STANDARD: "Thường",
  VIP: "VIP",
  COUPLE: "Ghế đôi",
};

const ROOM_STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  MAINTENANCE: "Bảo trì",
};

const emptyForm = {
  cinemaId: "",
  name: "",
  roomCode: "",
  seatCount: 80,
  roomType: "STANDARD_2D",
  status: "ACTIVE",
};

function groupSeatsByRow(seats = []) {
  return seats.reduce((rows, seat) => {
    const rowLabel = seat.rowLabel || "";
    if (!rows[rowLabel]) rows[rowLabel] = [];
    rows[rowLabel].push(seat);
    return rows;
  }, {});
}

function sortRowLabels(a, b) {
  return rowRank(a) - rowRank(b);
}

function rowRank(label = "") {
  return label.split("").reduce((value, char) => {
    return value * 26 + char.charCodeAt(0) - 64;
  }, 0);
}

export default function RoomManagementPage() {
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCinemas = useCallback(async () => {
    try {
      const response = await getAdminCinemas();
      const cinemaList = response.data || [];
      setCinemas(cinemaList);

      if (cinemaList.length > 0) {
        setForm((current) =>
          current.cinemaId
            ? current
            : {
                ...current,
                cinemaId: cinemaList[0].id,
              }
        );
      }
    } catch (err) {
      console.error("Không thể tải danh sách rạp:", err);
      showToast("Không thể tải danh sách rạp", "error");
    }
  }, [showToast]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params =
        selectedCinemaId === "ALL" ? {} : { cinemaId: selectedCinemaId };
      const response = await getAdminRooms(params);
      const roomList = response.data || [];
      setRooms(roomList);
      setSelectedRoom((current) => {
        if (current && roomList.some((room) => room.id === current.id)) {
          return roomList.find((room) => room.id === current.id);
        }
        return roomList[0] || null;
      });
    } catch (err) {
      console.error("Không thể tải danh sách phòng chiếu:", err);
      showToast("Không thể tải danh sách phòng chiếu", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedCinemaId, showToast]);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (editingRoom) return;
    if (selectedCinemaId !== "ALL") {
      setForm((current) => ({
        ...current,
        cinemaId: Number(selectedCinemaId),
      }));
    }
  }, [editingRoom, selectedCinemaId]);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rooms;

    return rooms.filter((room) =>
      [
        room.name,
        room.roomCode,
        room.cinemaName,
        room.roomType,
        room.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [rooms, search]);

  const stats = useMemo(() => {
    return {
      totalRooms: rooms.length,
      activeRooms: rooms.filter((room) => room.status === "ACTIVE").length,
      maintenanceRooms: rooms.filter((room) => room.status === "MAINTENANCE")
        .length,
      totalSeats: rooms.reduce((sum, room) => sum + (room.seatCount || 0), 0),
    };
  }, [rooms]);

  const selectedRows = useMemo(() => {
    const grouped = groupSeatsByRow(selectedRoom?.seats);
    return Object.keys(grouped)
      .sort(sortRowLabels)
      .map((rowLabel) => ({
        rowLabel,
        seats: grouped[rowLabel].sort(
          (a, b) => a.columnNumber - b.columnNumber
        ),
      }));
  }, [selectedRoom]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "seatCount" || name === "cinemaId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        cinemaId: Number(form.cinemaId),
        seatCount: Number(form.seatCount),
      };

      if (editingRoom) {
        await updateAdminRoom(editingRoom.id, payload);
        showToast("Cập nhật phòng chiếu thành công");
      } else {
        await createAdminRoom(payload);
        showToast("Tạo phòng chiếu thành công");
      }

      handleReset();
      fetchRooms();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể lưu phòng chiếu"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setSelectedRoom(room);
    setForm({
      cinemaId: room.cinemaId,
      name: room.name || "",
      roomCode: room.roomCode || "",
      seatCount: room.seatCount || 1,
      roomType: room.roomType || "STANDARD_2D",
      status: room.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleDelete = async (room) => {
    const message = room.hasShowtimes
      ? "Phòng này đã có lịch chiếu nên không thể xóa."
      : `Bạn có chắc muốn xóa phòng ${room.roomCode}?`;

    if (!window.confirm(message)) return;

    try {
      await deleteAdminRoom(room.id);
      showToast("Xóa phòng chiếu thành công");
      if (editingRoom?.id === room.id) handleReset();
      fetchRooms();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể xóa phòng chiếu"), "error");
    }
  };

  const handleReset = () => {
    setEditingRoom(null);
    setModalOpen(false);
    setForm({
      ...emptyForm,
      cinemaId:
        selectedCinemaId !== "ALL"
          ? Number(selectedCinemaId)
          : cinemas[0]?.id || "",
    });
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setForm({
      ...emptyForm,
      cinemaId:
        selectedCinemaId !== "ALL"
          ? Number(selectedCinemaId)
          : cinemas[0]?.id || "",
    });
    setModalOpen(true);
  };

  const layoutLocked = Boolean(editingRoom?.hasShowtimes);

  return (
    <div className="room-management-page">
      {toast && <div className={`room-toast ${toast.type}`}>{toast.message}</div>}

      <div className="room-page-header">
        <h1 className="room-page-title">
          <span className="room-page-title-icon">#</span>
          Quản lý Phòng chiếu
          <span className="room-count-badge">{stats.totalRooms} phòng</span>
        </h1>
        <button className="btn-create-room" onClick={handleCreate}>
          + Thêm phòng
        </button>
      </div>

      <div className="room-stats">
        <div className="room-stat">
          <span>{stats.totalRooms}</span>
          <p>Tổng phòng</p>
        </div>
        <div className="room-stat">
          <span>{stats.activeRooms}</span>
          <p>Đang hoạt động</p>
        </div>
        <div className="room-stat">
          <span>{stats.maintenanceRooms}</span>
          <p>Bảo trì</p>
        </div>
        <div className="room-stat">
          <span>{stats.totalSeats}</span>
          <p>Tổng ghế</p>
        </div>
      </div>

      <div className="room-toolbar">
        <select
          className="room-filter-select"
          value={selectedCinemaId}
          onChange={(event) => setSelectedCinemaId(event.target.value)}
        >
          <option value="ALL">Tất cả rạp</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>

        <div className="room-search">
          <span className="room-search-icon">🔍</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên phòng, mã phòng, rạp..."
          />
        </div>
      </div>

      <div className="room-workspace">
        <section className="room-table-section">
          {loading ? (
            <div className="room-loading">
              <div className="room-loading-spinner" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="room-empty">
              <div className="room-empty-icon">[]</div>
              <h3>Chưa có phòng chiếu</h3>
              <p>Chọn rạp và thêm phòng đầu tiên để bắt đầu.</p>
            </div>
          ) : (
            <div className="room-table-wrapper">
              <table className="room-table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Rạp</th>
                    <th>Loại</th>
                    <th>Số ghế</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr
                      key={room.id}
                      className={selectedRoom?.id === room.id ? "selected" : ""}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <td>
                        <strong>{room.name}</strong>
                        <small>{room.roomCode}</small>
                      </td>
                      <td>{room.cinemaName}</td>
                      <td>
                        <span className={`room-type ${room.roomType?.toLowerCase()}`}>
                          {ROOM_TYPE_OPTIONS.find((type) => type.value === room.roomType)
                            ?.label || room.roomType}
                        </span>
                      </td>
                      <td>{room.seatCount}</td>
                      <td>
                        <span className={`room-status ${room.status?.toLowerCase()}`}>
                          {ROOM_STATUS_LABELS[room.status] || room.status}
                        </span>
                      </td>
                      <td>
                        <div className="room-actions">
                          <button
                            type="button"
                            className="btn-room-action edit"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEdit(room);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-room-action delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(room);
                            }}
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

        <aside className="room-side-panel">
          <div className="seat-preview">
            <div className="room-panel-heading">
              <h2>Sơ đồ ghế</h2>
              {selectedRoom && <span>{selectedRoom.seatCount} ghế</span>}
            </div>

            {!selectedRoom ? (
              <div className="seat-preview-empty">Chọn một phòng để xem ghế.</div>
            ) : (
              <>
                <div className="screen-label">MÀN HÌNH</div>
                <div className="seat-map">
                  {selectedRows.map((row) => (
                    <div className="seat-row" key={row.rowLabel}>
                      <span className="seat-row-label">{row.rowLabel}</span>
                      <div className="seat-row-grid">
                        {row.seats.map((seat) => (
                          <span
                            key={`${seat.rowLabel}-${seat.columnNumber}`}
                            className={`seat-dot ${seat.seatType?.toLowerCase()}`}
                            title={`${seat.rowLabel}${seat.columnNumber} - ${
                              SEAT_TYPE_LABELS[seat.seatType] || seat.seatType
                            }`}
                          >
                            {seat.columnNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="seat-legend">
                  {Object.entries(SEAT_TYPE_LABELS).map(([type, label]) => (
                    <span key={type}>
                      <i className={`seat-dot ${type.toLowerCase()}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {modalOpen && (
        <div className="room-modal-overlay" onClick={handleReset}>
          <div className="room-modal" onClick={(event) => event.stopPropagation()}>
            <div className="room-modal-header">
              <h2>{editingRoom ? "Sửa phòng chiếu" : "Thêm phòng chiếu mới"}</h2>
              <button type="button" className="room-modal-close" onClick={handleReset}>
                ×
              </button>
            </div>

            <form className="room-modal-form" onSubmit={handleSubmit}>
              <div className="room-modal-section-title">Thông tin phòng chiếu</div>

              {layoutLocked && (
                <div className="room-form-note">
                  Phòng đã có lịch chiếu, chỉ có thể sửa tên, mã phòng và trạng thái.
                </div>
              )}

              <div className="room-form-grid">
                <label>
                  Rạp *
                  <select
                    name="cinemaId"
                    value={form.cinemaId}
                    onChange={handleChange}
                    disabled={layoutLocked}
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

              <div className="room-form-grid">
                <label>
                  Tên phòng *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Phòng 01"
                    required
                  />
                </label>

                <div className="room-generated-code">
                  <span>Mã phòng</span>
                  <strong>{editingRoom?.roomCode || "Tự động tạo sau khi lưu"}</strong>
                  <small>Hệ thống tự sinh mã theo tên phòng và rạp, tránh trùng lặp.</small>
                </div>
              </div>

              <div className="room-form-grid">
                <label>
                  Số ghế *
                  <input
                    name="seatCount"
                    type="number"
                    min="1"
                    value={form.seatCount}
                    onChange={handleChange}
                    disabled={layoutLocked}
                    required
                  />
                </label>

                <label>
                  Loại phòng
                  <select
                    name="roomType"
                    value={form.roomType}
                    onChange={handleChange}
                    disabled={layoutLocked}
                  >
                    {ROOM_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="room-modal-actions">
                <button type="button" className="btn-room-cancel" onClick={handleReset}>
                  Hủy
                </button>
                <button className="btn-room-submit" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : editingRoom ? "Lưu thay đổi" : "Tạo phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
