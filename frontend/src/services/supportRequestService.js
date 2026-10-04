import axios from "axios";

const API_URL = "http://localhost:8081/api/support";

const getToken = () => {
    return localStorage.getItem("token");
};

const supportRequestService = {

    create: async (data) => {

        const response = await axios.post(
            API_URL,
            data,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    },

    getMyRequests: async () => {

        const response = await axios.get(
            `${API_URL}/my-requests`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

        return response.data;
    }
};

export default supportRequestService;