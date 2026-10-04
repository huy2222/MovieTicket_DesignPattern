import api from "../api/axiosConfig";


/**
 * Tra cứu thông tin đơn combo thuộc booking theo mã booking / mã vé
 * @param {string} bookingCode 
 */
export const searchComboOrders = async (bookingCode) => {
  const response = await api.get(`/api/staff/combo-orders/search`, {
    params: { bookingCode },
  });
  return response.data;
};

/**
 * Staff xác nhận khách đã nhận 1 combo cụ thể
 * @param {number|string} comboOrderId - ID của bookingCombo
 */
export const confirmComboReceived = async (comboOrderId) => {
  const response = await api.patch(`/api/staff/combo-orders/${comboOrderId}/receive`);
  return response.data;
};

/**
 * Lấy danh sách các Combo đang hoạt động
 */
export const getActiveCombos = async () => {
  const response = await api.get(`/api/combos`);
  return response.data;
};
