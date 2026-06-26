import api from "../api/axiosConfig";

export const getDashboardOverview = (params) =>
  api.get("/admin/dashboard/overview", { params });
export const getDashboardCharts = (params) =>
  api.get("/admin/dashboard/charts", { params });
