import api from '../api/axiosConfig';

const API_URL = '/bookings';

export const getCitiesWithShowtimes = async (movieId, date) => {
    const response = await api.get(`${API_URL}/cities`, {
        params: { movieId, date }
    });
    return response.data;
};

export const getCinemasAndShowtimes = async (movieId, city, date) => {
    const response = await api.get(`${API_URL}/cinemas`, {
        params: { movieId, city, date }
    });
    return response.data;
};

export const getShowtimeSeats = async (showtimeId) => {
    const response = await api.get(`${API_URL}/showtimes/${showtimeId}/seats`);
    return response.data;
};

export const checkout = async (bookingRequest) => {
    const response = await api.post(`${API_URL}/checkout`, bookingRequest);
    return response.data;
};
