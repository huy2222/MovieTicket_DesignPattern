import api from "../api/axiosConfig";

export const getGenres = () => api.get("/genres");
