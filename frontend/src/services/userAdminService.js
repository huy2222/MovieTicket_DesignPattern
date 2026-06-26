import api from "../api/axiosConfig";

export const getAllUsers = () => api.get("/admin/customers");
export const getUserById = (id) => api.get(`/admin/customers/${id}`);
export const blockUser = (id) => api.put(`/admin/customers/${id}/block`);
export const unblockUser = (id) => api.put(`/admin/customers/${id}/unblock`);