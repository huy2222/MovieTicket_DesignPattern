import api from "../api/axiosConfig";
import { serializeMovieSearchParams } from "../utils/movieSearchParams";

export const getAdminMovies = (params = {}) =>
  api.get("/movies/search", {
    params: { ...params, adminContext: true },
    paramsSerializer: serializeMovieSearchParams,
  });

export const getAdminMovieById = (movieId) =>
  api.get(`/movies/${movieId}`);

export const createAdminMovie = (movieData) =>
  api.post("/movies", movieData);

export const updateAdminMovie = (movieId, movieData) =>
  api.put(`/movies/${movieId}`, movieData);

export const updateAdminMovieStatus = (movieId, status) =>
  api.patch(`/movies/${movieId}/status`, { status });

export const deleteAdminMovie = (movieId) =>
  api.delete(`/movies/${movieId}`);
