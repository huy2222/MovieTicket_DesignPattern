import api from "../api/axiosConfig";

export const getMyBookings = () => {
  return api.get("/customer/bookings/my");
};

export const getBookingDetail = (bookingId) => {
  return api.get(`/customer/bookings/${bookingId}`);
};
