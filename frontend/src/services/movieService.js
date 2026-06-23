import api from "../api/axiosConfig";

export const getNowShowing = () =>
  api.get("/movies", { params: { status: "NOW_SHOWING" } });

export const getComingSoon = () =>
  api.get("/movies", { params: { status: "COMING_SOON" } });

export const getMovieById = (id) => api.get(`/movies/${id}`);
