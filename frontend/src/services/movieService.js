import api from "../api/axiosConfig";
import { serializeMovieSearchParams } from "../utils/movieSearchParams";

export const getHomeMovies = () => api.get("/movies/home");

export const getNowShowing = () =>
  api.get("/movies", { params: { status: "NOW_SHOWING" } });

export const getComingSoon = () =>
  api.get("/movies", { params: { status: "COMING_SOON" } });

export const getMovieById = (id) => api.get(`/movies/${id}`);

export const searchMovies = (params = {}) =>
  api.get("/movies/search", {
    params,
    paramsSerializer: serializeMovieSearchParams,
  });
