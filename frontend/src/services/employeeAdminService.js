import api from "../api/axiosConfig";

export const getEmployees = (params) => api.get("/admin/employees", { params });
export const getEmployeeById = (id) => api.get(`/admin/employees/${id}`);
export const createEmployee = (data) => api.post("/admin/employees", data);
export const updateEmployee = (id, data) => api.put(`/admin/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/admin/employees/${id}`);
export const lockEmployee = (id) => api.patch(`/admin/employees/${id}/lock`);
export const unlockEmployee = (id) => api.patch(`/admin/employees/${id}/unlock`);
export const changeEmployeePassword = (id, data) =>
  api.patch(`/admin/employees/${id}/password`, data);
