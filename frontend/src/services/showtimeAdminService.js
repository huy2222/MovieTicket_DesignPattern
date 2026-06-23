import api from "../api/axiosConfig";

export const getAdminShowtimes = (params = {}) =>
  api.get("/admin/showtimes", { params });

export const getAdminShowtimeById = (showtimeId) =>
  api.get(`/admin/showtimes/${showtimeId}`);

export const createAdminShowtime = (showtimeData) =>
  api.post("/admin/showtimes", showtimeData);

export const updateAdminShowtime = (showtimeId, showtimeData) =>
  api.put(`/admin/showtimes/${showtimeId}`, showtimeData);

export const deleteAdminShowtime = (showtimeId) =>
  api.delete(`/admin/showtimes/${showtimeId}`);
