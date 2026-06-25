import api from "../api/axiosConfig";

export const getProfile = () => api.get(`/customers/me`);
export const updateProfile = (profileData) => api.put(`/customers/me`, profileData);
