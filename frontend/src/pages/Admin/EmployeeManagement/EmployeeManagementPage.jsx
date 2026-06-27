import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeEmployeePassword,
  createEmployee,
  deleteEmployee,
  getEmployees,
  lockEmployee,
  unlockEmployee,
  updateEmployee,
} from "../../../services/employeeAdminService";
import { getAdminCinemas } from "../../../services/cinemaAdminService";
import { getApiErrorMessage } from "../../../utils/apiError";
import "./EmployeeManagementPage.css";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Quản trị viên (ADMIN)" },
  { value: "STAFF", label: "Nhân viên (STAFF)" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "LOCKED", label: "Đã khóa" },
  { value: "INACTIVE", label: "Không hoạt động" },
];

const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  INACTIVE: "Không hoạt động",
};

const EMPTY_FORM = {
  email: "",
  fullName: "",
  password: "",
  phoneNumber: "",
  role: "STAFF",
  position: "",
  cinemaId: "",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
}

export default function EmployeeManagementPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const queryParams = {
    page,
    size: PAGE_SIZE,
    sortBy,
    sortDirection,
    ...(search.trim() && { search: search.trim() }),
    ...(roleFilter !== "ALL" && { role: roleFilter }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
  };

  const employeesQuery = useQuery({
    queryKey: ["employees", queryParams],
    queryFn: async () => {
      const res = await getEmployees(queryParams);
      return res.data;
    },
  });

  const cinemasQuery = useQuery({
    queryKey: ["admin-cinemas"],
    queryFn: async () => {
      const res = await getAdminCinemas();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

  const employees = employeesQuery.data?.content || [];
  const totalPages = employeesQuery.data?.totalPages || 0;
  const totalElements = employeesQuery.data?.totalElements || 0;
  const cinemas = cinemasQuery.data || [];

  const invalidateEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setForm({
      email: employee.email || "",
      fullName: employee.fullName || "",
      password: "",
      phoneNumber: employee.phoneNumber || "",
      role: employee.role || "STAFF",
      position: employee.position || "",
      cinemaId: employee.cinemaId ? String(employee.cinemaId) : "",
    });
    setModalOpen(true);
  };

  const openPasswordModal = (employee) => {
    setEditingEmployee(employee);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        role: form.role,
        position: form.role === "STAFF" ? form.position.trim() || null : null,
        cinemaId: form.role === "STAFF" && form.cinemaId ? Number(form.cinemaId) : null,
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload);
        showToast("Cập nhật nhân viên thành công!");
      } else {
        await createEmployee({ ...payload, password: form.password });
        showToast("Tạo nhân viên thành công!");
      }
      setModalOpen(false);
      invalidateEmployees();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Thao tác thất bại"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setSubmitting(true);
    try {
      await changeEmployeePassword(editingEmployee.id, { newPassword });
      showToast("Đổi mật khẩu thành công!");
      setPasswordModalOpen(false);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Đổi mật khẩu thất bại"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Xóa tài khoản "${employee.fullName}"?`)) return;
    try {
      await deleteEmployee(employee.id);
      showToast("Đã xóa nhân viên!");
      invalidateEmployees();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể xóa nhân viên"), "error");
    }
  };

  const handleLockToggle = async (employee) => {
    try {
      if (employee.status === "LOCKED") {
        await unlockEmployee(employee.id);
        showToast("Đã mở khóa tài khoản!");
      } else {
        if (!window.confirm("Khóa tài khoản này?")) return;
        await lockEmployee(employee.id);
        showToast("Đã khóa tài khoản!");
      }
      invalidateEmployees();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Thao tác thất bại"), "error");
    }
  };

  return (
    <div className="employee-page">
      <div className="employee-page-header">
        <h1 className="employee-page-title">
          Quản lý nhân viên
          <span className="employee-count-badge">{totalElements}</span>
        </h1>
        <button type="button" className="btn-create-employee" onClick={openCreateModal}>
          + Thêm nhân viên
        </button>
      </div>

      <div className="employee-toolbar">
        <form className="employee-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm theo email, tên, SĐT..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="employee-search-input"
          />
          <button type="submit" className="employee-search-btn">
            Tìm
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          className="employee-filter-select"
        >
          <option value="ALL">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="employee-filter-select"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
          className="employee-filter-select"
        >
          <option value="createdAt">Ngày tạo</option>
          <option value="fullName">Họ tên</option>
          <option value="email">Email</option>
          <option value="role">Vai trò</option>
          <option value="status">Trạng thái</option>
        </select>

        <select
          value={sortDirection}
          onChange={(e) => { setSortDirection(e.target.value); setPage(0); }}
          className="employee-filter-select"
        >
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>
      </div>

      {employeesQuery.isLoading ? (
        <div className="employee-loading">Đang tải...</div>
      ) : employeesQuery.isError ? (
        <div className="employee-error">
          {getApiErrorMessage(employeesQuery.error, "Không thể tải danh sách nhân viên")}
        </div>
      ) : (
        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Chức vụ</th>
                <th>Rạp</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="employee-empty">Không có dữ liệu</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.email}</td>
                    <td>{emp.fullName}</td>
                    <td>
                      <span className={`role-badge role-${emp.role?.toLowerCase()}`}>
                        {emp.role === "ADMIN" ? "Admin" : "Nhân viên"}
                      </span>
                    </td>
                    <td>{emp.position || "—"}</td>
                    <td>{emp.cinemaName || "—"}</td>
                    <td>
                      <span className={`status-badge status-${emp.status?.toLowerCase()}`}>
                        {STATUS_LABELS[emp.status] || emp.status}
                      </span>
                    </td>
                    <td>{formatDate(emp.createdAt)}</td>
                    <td className="employee-actions">
                      <button type="button" onClick={() => openEditModal(emp)}>Sửa</button>
                      <button type="button" onClick={() => openPasswordModal(emp)}>Mật khẩu</button>
                      <button type="button" onClick={() => handleLockToggle(emp)}>
                        {emp.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                      </button>
                      <button type="button" className="btn-danger" onClick={() => handleDelete(emp)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="employee-pagination">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ‹ Trước
          </button>
          <span>Trang {page + 1} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Sau ›
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="employee-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Email *
                <input name="email" type="email" required value={form.email} onChange={handleFormChange} />
              </label>
              <label>
                Họ tên *
                <input name="fullName" required value={form.fullName} onChange={handleFormChange} />
              </label>
              {!editingEmployee && (
                <label>
                  Mật khẩu *
                  <input name="password" type="password" required minLength={6} value={form.password} onChange={handleFormChange} />
                </label>
              )}
              <label>
                Số điện thoại
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} />
              </label>
              <label>
                Vai trò *
                <select name="role" value={form.role} onChange={handleFormChange} disabled={!!editingEmployee}>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              {form.role === "STAFF" && (
                <>
                  <label>
                    Chức vụ
                    <input name="position" value={form.position} onChange={handleFormChange} />
                  </label>
                  <label>
                    Rạp làm việc *
                    <select name="cinemaId" required value={form.cinemaId} onChange={handleFormChange}>
                      <option value="">-- Chọn rạp --</option>
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              <div className="employee-modal-actions">
                <button type="button" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="employee-modal-overlay" onClick={() => setPasswordModalOpen(false)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Đổi mật khẩu — {editingEmployee?.fullName}</h2>
            <form onSubmit={handlePasswordSubmit}>
              <label>
                Mật khẩu mới *
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <div className="employee-modal-actions">
                <button type="button" onClick={() => setPasswordModalOpen(false)}>Hủy</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`employee-toast employee-toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
