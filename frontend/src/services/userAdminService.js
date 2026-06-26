import api from "../api/axiosConfig";

export const getAllUsers = () => api.get("/admin/customers");
export const blockUser = (id) => api.post(`/admin/customers/${id}/block`);
export const unblockUser = (id) => api.post(`/admin/customers/${id}/unblock`);