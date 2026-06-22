import api from "../api/axiosConfig";

export const getAdminMovies = (params = {}) =>
  api.get("/movies", { params });

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
