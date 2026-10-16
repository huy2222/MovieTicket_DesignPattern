import api from "../api/axiosConfig";

const favoriteService = {
  getFavorites: async () => {
    const response = await api.get("/favorites");
    return response.data;
  },

  addFavorite: async (movieId) => {
    const response = await api.post(`/favorites/${movieId}`);
    return response.data;
  },

  removeFavorite: async (movieId) => {
    const response = await api.delete(`/favorites/${movieId}`);
    return response.data;
  },

  checkFavorite: async (movieId) => {
    const response = await api.get(`/favorites/check/${movieId}`);
    return response.data;
  },
};

export default favoriteService;
