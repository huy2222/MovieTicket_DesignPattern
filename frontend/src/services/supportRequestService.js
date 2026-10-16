import api from "../api/axiosConfig";

const supportRequestService = {
  create: async (data) => {
    const response = await api.post("/support", data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get("/support/my-requests");
    return response.data;
  },
};

export default supportRequestService;