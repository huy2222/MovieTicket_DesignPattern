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

const SEARCH_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả trường" },
  { value: "fullName", label: "Họ tên" },
  { value: "email", label: "Email" },
  { value: "phoneNumber", label: "Số điện thoại" },
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
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function validateForm(form, isEdit) {
  const errors = {};

  const email = form.email.trim();
  if (!email) {
    errors.email = "Email không được để trống";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ";
  }

  const fullName = form.fullName.trim();
  if (!fullName) {
    errors.fullName = "Họ tên không được để trống";
  } else if (fullName.length > 100) {
    errors.fullName = "Họ tên tối đa 100 ký tự";
  }

  if (!isEdit) {
    if (!form.password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 6) {
      errors.password = "Mật khẩu tối thiểu 6 ký tự";
    }
  }

  const phone = form.phoneNumber.trim();
  if (phone && !/^0[0-9]{9,10}$/.test(phone)) {
    errors.phoneNumber = "Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số";
  }

  if (form.role === "STAFF" && !isEdit && !form.cinemaId) {
    errors.cinemaId = "Nhân viên phải được gán rạp làm việc";
  }

  if (form.role === "STAFF" && form.position.trim().length > 100) {
    errors.position = "Chức vụ tối đa 100 ký tự";
  }

  return errors;
}

function validatePassword(password) {
  if (!password) return "Mật khẩu không được để trống";
  if (password.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
  return null;
}

function EmployeeAvatar({ employee }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(employee.fullName);
  const showImg = employee.avatarUrl && !imgError;

  return showImg ? (
    <img
      src={employee.avatarUrl}
      alt={employee.fullName}
      className="employee-avatar-img"
      onError={() => setImgError(true)}
    />
  ) : (
    <span className="employee-avatar-fallback">{initials}</span>
  );
}

export default function EmployeeManagementPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("all");
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
  const [formErrors, setFormErrors] = useState({});
  const [passwordError, setPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const queryParams = {
    page,
    size: PAGE_SIZE,
    sortBy,
    sortDirection,
    ...(search.trim() && searchType === "all" && { search: search.trim() }),
    ...(search.trim() && searchType === "fullName" && { fullName: search.trim() }),
    ...(search.trim() && searchType === "email" && { email: search.trim() }),
    ...(search.trim() && searchType === "phoneNumber" && { phoneNumber: search.trim() }),
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

  const patchEmployeeInCache = useCallback(
    (employeeId, updater) => {
      queryClient.setQueriesData({ queryKey: ["employees"] }, (old) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((emp) =>
            emp.id === employeeId ? updater(emp) : emp
          ),
        };
      });
    },
    [queryClient]
  );

  const removeEmployeeFromCache = useCallback(
    (employeeId) => {
      queryClient.setQueriesData({ queryKey: ["employees"] }, (old) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((emp) => emp.id !== employeeId),
          totalElements: Math.max(0, (old.totalElements || 0) - 1),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    [queryClient]
  );

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setSearchType("all");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setSortBy("createdAt");
    setSortDirection("desc");
    setPage(0);
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
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
    setFormErrors({});
    setModalOpen(true);
  };

  const openPasswordModal = (employee) => {
    setEditingEmployee(employee);
    setNewPassword("");
    setPasswordError("");
    setPasswordModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form, !!editingEmployee);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        role: form.role,
        position: form.role === "STAFF" ? form.position.trim() || null : null,
        cinemaId:
          form.role === "STAFF" && form.cinemaId ? Number(form.cinemaId) : null,
      };

      if (editingEmployee) {
        const res = await updateEmployee(editingEmployee.id, payload);
        patchEmployeeInCache(editingEmployee.id, () => res.data);
        showToast("Cập nhật nhân viên thành công!");
      } else {
        await createEmployee({ ...payload, password: form.password });
        showToast("Tạo nhân viên thành công!");
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        refreshDashboard();
      }
      setModalOpen(false);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Thao tác thất bại"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const error = validatePassword(newPassword);
    if (error) {
      setPasswordError(error);
      return;
    }

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
    setActionLoadingId(employee.id);
    try {
      await deleteEmployee(employee.id);
      removeEmployeeFromCache(employee.id);
      showToast("Đã xóa nhân viên!");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể xóa nhân viên"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLockToggle = async (employee) => {
    if (employee.status !== "LOCKED") {
      if (!window.confirm(`Khóa tài khoản "${employee.fullName}"?`)) return;
    }

    setActionLoadingId(employee.id);
    try {
      const res =
        employee.status === "LOCKED"
          ? await unlockEmployee(employee.id)
          : await lockEmployee(employee.id);

      patchEmployeeInCache(employee.id, () => res.data);
      showToast(
        employee.status === "LOCKED"
          ? "Đã mở khóa tài khoản!"
          : "Đã khóa tài khoản!"
      );
    } catch (err) {
      showToast(getApiErrorMessage(err, "Thao tác thất bại"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const searchPlaceholder =
    {
      all: "Tìm theo email, tên, SĐT...",
      fullName: "Nhập họ tên...",
      email: "Nhập email...",
      phoneNumber: "Nhập số điện thoại...",
    }[searchType] || "Tìm kiếm...";

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
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="employee-filter-select employee-search-type"
            aria-label="Loại tìm kiếm"
          >
            {SEARCH_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder={searchPlaceholder}
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
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(0);
          }}
          className="employee-filter-select"
          aria-label="Lọc vai trò"
        >
          <option value="ALL">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="employee-filter-select"
          aria-label="Lọc trạng thái"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(0);
          }}
          className="employee-filter-select"
          aria-label="Sắp xếp theo"
        >
          <option value="createdAt">Ngày tạo</option>
          <option value="fullName">Họ tên</option>
          <option value="email">Email</option>
          <option value="role">Vai trò</option>
          <option value="status">Trạng thái</option>
        </select>

        <select
          value={sortDirection}
          onChange={(e) => {
            setSortDirection(e.target.value);
            setPage(0);
          }}
          className="employee-filter-select"
          aria-label="Thứ tự sắp xếp"
        >
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>

        <button type="button" className="employee-reset-btn" onClick={handleResetFilters}>
          Đặt lại
        </button>
      </div>

      {employeesQuery.isLoading ? (
        <div className="employee-loading">
          <div className="employee-loading-spinner" />
          Đang tải danh sách nhân viên...
        </div>
      ) : employeesQuery.isError ? (
        <div className="employee-error">
          {getApiErrorMessage(employeesQuery.error, "Không thể tải danh sách nhân viên")}
        </div>
      ) : (
        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="employee-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className={actionLoadingId === emp.id ? "row-loading" : ""}>
                    <td>
                      <div className="employee-avatar-cell">
                        <EmployeeAvatar employee={emp} />
                      </div>
                    </td>
                    <td className="employee-name-cell">{emp.fullName}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phoneNumber || "—"}</td>
                    <td>
                      <span className={`role-badge role-${emp.role?.toLowerCase()}`}>
                        {emp.role === "ADMIN" ? "Admin" : "Nhân viên"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${emp.status?.toLowerCase()}`}>
                        {STATUS_LABELS[emp.status] || emp.status}
                      </span>
                    </td>
                    <td>{formatDate(emp.createdAt)}</td>
                    <td className="employee-actions">
                      <button
                        type="button"
                        onClick={() => openEditModal(emp)}
                        disabled={actionLoadingId === emp.id}
                        title="Chỉnh sửa"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => openPasswordModal(emp)}
                        disabled={actionLoadingId === emp.id}
                        title="Đặt lại mật khẩu"
                      >
                        Mật khẩu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLockToggle(emp)}
                        disabled={actionLoadingId === emp.id}
                        title={emp.status === "LOCKED" ? "Mở khóa" : "Khóa tài khoản"}
                      >
                        {emp.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(emp)}
                        disabled={actionLoadingId === emp.id}
                        title="Xóa"
                      >
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
          <span>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau ›
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="employee-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}</h2>
            <form onSubmit={handleSubmit} noValidate>
              <label>
                Email *
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className={formErrors.email ? "input-error" : ""}
                />
                {formErrors.email && (
                  <span className="field-error">{formErrors.email}</span>
                )}
              </label>
              <label>
                Họ tên *
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleFormChange}
                  className={formErrors.fullName ? "input-error" : ""}
                />
                {formErrors.fullName && (
                  <span className="field-error">{formErrors.fullName}</span>
                )}
              </label>
              {!editingEmployee && (
                <label>
                  Mật khẩu *
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    className={formErrors.password ? "input-error" : ""}
                  />
                  {formErrors.password && (
                    <span className="field-error">{formErrors.password}</span>
                  )}
                </label>
              )}
              <label>
                Số điện thoại
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFormChange}
                  placeholder="0xxxxxxxxx"
                  className={formErrors.phoneNumber ? "input-error" : ""}
                />
                {formErrors.phoneNumber && (
                  <span className="field-error">{formErrors.phoneNumber}</span>
                )}
              </label>
              <label>
                Vai trò *
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  disabled={!!editingEmployee}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {form.role === "STAFF" && (
                <>
                  <label>
                    Chức vụ
                    <input
                      name="position"
                      value={form.position}
                      onChange={handleFormChange}
                      className={formErrors.position ? "input-error" : ""}
                    />
                    {formErrors.position && (
                      <span className="field-error">{formErrors.position}</span>
                    )}
                  </label>
                  <label>
                    Rạp làm việc {!editingEmployee && "*"}
                    <select
                      name="cinemaId"
                      value={form.cinemaId}
                      onChange={handleFormChange}
                      className={formErrors.cinemaId ? "input-error" : ""}
                    >
                      <option value="">-- Chọn rạp --</option>
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.cinemaId && (
                      <span className="field-error">{formErrors.cinemaId}</span>
                    )}
                  </label>
                </>
              )}
              <div className="employee-modal-actions">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
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
            <h2>Đặt lại mật khẩu — {editingEmployee?.fullName}</h2>
            <form onSubmit={handlePasswordSubmit} noValidate>
              <label>
                Mật khẩu mới *
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className={passwordError ? "input-error" : ""}
                />
                {passwordError && <span className="field-error">{passwordError}</span>}
              </label>
              <div className="employee-modal-actions">
                <button type="button" onClick={() => setPasswordModalOpen(false)}>
                  Hủy
                </button>
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
