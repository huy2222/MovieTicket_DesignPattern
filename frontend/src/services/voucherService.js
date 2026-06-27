import api from "../api/axiosConfig";

// ============================================
// Voucher Service — Admin API calls
// ============================================

// Lấy danh sách tất cả voucher
export const getAllVouchers = () => api.get("/admin/vouchers");

// Lấy chi tiết 1 voucher
export const getVoucherById = (id) => api.get(`/admin/vouchers/${id}`);

// Tạo voucher mới
export const createVoucher = (data) => api.post("/admin/vouchers", data);

// Cập nhật voucher
export const updateVoucher = (id, data) =>
  api.put(`/admin/vouchers/${id}`, data);

// Kích hoạt voucher (DRAFT/SUSPENDED → ACTIVE)
export const activateVoucher = (id) =>
  api.patch(`/admin/vouchers/${id}/activate`);

// Tạm ngưng voucher (ACTIVE → SUSPENDED)
export const suspendVoucher = (id) =>
  api.patch(`/admin/vouchers/${id}/suspend`);

// Xoá voucher (chỉ khi DRAFT)
export const deleteVoucher = (id) => api.delete(`/admin/vouchers/${id}`);

// ============================================
// Public API calls
// ============================================

// Lấy danh sách voucher có thể áp dụng cho đơn hàng hiện tại
export const getApplicableVouchers = (originalPrice, ticketCount) => 
  api.get(`/vouchers/applicable`, { params: { originalPrice, ticketCount } });

