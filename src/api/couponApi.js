import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// 🟢 Lấy danh sách coupon (có phân trang + tìm kiếm)
export const getCoupons = async (page = 1, limit = 10, search = "") => {
  const res = await axios.get(`${API_URL}/coupons?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

// 🟢 Thêm mã giảm giá
export const createCoupon = async (data) => {
  const res = await axios.post(`${API_URL}/coupons`, data);
  return res.data;
};

// 🟢 Cập nhật mã giảm giá
export const updateCoupon = async (id, data) => {
  const res = await axios.put(`${API_URL}/coupons/${id}`, data);
  return res.data;
};

// 🟢 Xóa mã giảm giá
export const deleteCoupon = async (id) => {
  const res = await axios.delete(`${API_URL}/coupons/${id}`);
  return res.data;
};
