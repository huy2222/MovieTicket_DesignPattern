import api from "../api/axiosConfig";

export const getFeaturedMovie = () => api.get("/movies/featured");
export const getNowShowing = () => api.get("/movies/now-showing");
export const getComingSoon = () => api.get("/movies/coming-soon");