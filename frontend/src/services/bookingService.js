import axios from 'axios';

const API_URL = 'http://localhost:8081/api/bookings';

export const getCitiesWithShowtimes = async (movieId, date) => {
    const response = await axios.get(`${API_URL}/cities`, {
        params: { movieId, date }
    });
    return response.data;
};

export const getCinemasAndShowtimes = async (movieId, city, date) => {
    const response = await axios.get(`${API_URL}/cinemas`, {
        params: { movieId, city, date }
    });
    return response.data;
};

export const getShowtimeSeats = async (showtimeId) => {
    const response = await axios.get(`${API_URL}/showtimes/${showtimeId}/seats`);
    return response.data;
};

export const checkout = async (bookingRequest) => {
    const response = await axios.post(`${API_URL}/checkout`, bookingRequest);
    return response.data;
};
