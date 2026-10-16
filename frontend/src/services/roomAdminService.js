import api from "../api/axiosConfig";

export const getAdminRooms = (params = {}) =>
  api.get("/admin/rooms", { params });

export const getAdminRoomsByCinema = (cinemaId) =>
  api.get(`/admin/cinemas/${cinemaId}/rooms`);

export const getAdminRoomById = (roomId) =>
  api.get(`/admin/rooms/${roomId}`);

export const createAdminRoom = (roomData) =>
  api.post("/admin/rooms", roomData);

export const updateAdminRoom = (roomId, roomData) =>
  api.put(`/admin/rooms/${roomId}`, roomData);

export const deleteAdminRoom = (roomId) =>
  api.delete(`/admin/rooms/${roomId}`);
