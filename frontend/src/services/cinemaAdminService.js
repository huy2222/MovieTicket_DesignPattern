import api from "../api/axiosConfig";

export const getAdminCinemas = () => api.get("/admin/cinemas");
export const createAdminCinema = (cinemaData) => api.post("/admin/cinemas", cinemaData);
export const updateAdminCinema = (cinemaId, cinemaData) =>
  api.put(`/admin/cinemas/${cinemaId}`, cinemaData);
export const deleteAdminCinema = (cinemaId) => api.delete(`/admin/cinemas/${cinemaId}`);
