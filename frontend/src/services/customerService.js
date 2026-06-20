import api from "../api/axiosConfig";

export const getCustomerById = () => api.get(`/customers/me`);
