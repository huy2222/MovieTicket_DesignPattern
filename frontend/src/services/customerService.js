import api from "../api/axiosConfig";

export const getProfile = () => api.get(`/customers/me`);
export const updateProfile = (profileData) => api.put(`/customers/me`, profileData);
export const updateAvatar = (avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  return api.put(`/customers/me/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};