import api from "../api/axiosConfig";

export const getCineMeetReports = (status) =>
  api.get("/admin/cinemeet/reports", { params: status && status !== "ALL" ? { status } : {} });

export const getCineMeetReport = (id) => api.get(`/admin/cinemeet/reports/${id}`);

export const startCineMeetReportReview = (id) =>
  api.put(`/admin/cinemeet/reports/${id}/review`);

export const resolveCineMeetReport = (id, status, note) =>
  api.put(`/admin/cinemeet/reports/${id}/resolve`, { status, note });
