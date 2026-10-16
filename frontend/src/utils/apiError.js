export function getApiErrorMessage(error, fallback = "Đã xảy ra lỗi") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return data.message || data.detail || data.error || fallback;
}
