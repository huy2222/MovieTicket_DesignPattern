import api from "../api/axiosConfig";

export const getAllCombos = () => api.get("/combos");

export const getComboById = (id) => api.get(`/combos/${id}`);

export const createCombo = (data) => api.post("/combos", data);

export const updateCombo = (id, data) => api.put(`/combos/${id}`, data);

export const changeComboStatus = (id, isActive) => api.patch(`/combos/${id}/status`, { isActive });

export const deleteCombo = (id) => api.delete(`/combos/${id}`);
