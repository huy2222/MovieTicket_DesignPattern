import api from '../api/axiosConfig';

const API_URL = '/combos';

export const getActiveCombos = async () => {
    const response = await api.get(`${API_URL}/active`);
    return response.data;
};
