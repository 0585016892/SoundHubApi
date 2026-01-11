// src/api/colorApi.js
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

// Lấy danh sách màu, có thể phân trang và tìm kiếm
export const getColors = async ({ page = 1, limit = 10, search = "" } = {}) => {
  try {
    const res = await axios.get(`${API_URL}/colors`, {
      params: { page, limit, search },
    });

    if (Array.isArray(res.data)) {
      const data = res.data;
      return {
        data,
        page,
        limit,
        total: data.length,
        totalPages: 1,
      };
    }

    return res.data;
  } catch (err) {
    console.error("getColors error:", err);
    return { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
  }
};

// Lấy chi tiết màu theo id
export const getColorById = async (id) => {
  const res = await axios.get(`${API_URL}/colors/${id}`);
  return res.data;
};

// Thêm màu mới
export const createColor = async (data) => {
  // data: { name, code }
  const res = await axios.post(`${API_URL}/colors`, data);
  return res.data;
};

// Cập nhật màu
export const updateColor = async (id, data) => {
  // data: { name, code }
  const res = await axios.put(`${API_URL}/colors/${id}`, data);
  return res.data;
};

// Xóa màu
export const deleteColor = async (id) => {
  const res = await axios.delete(`${API_URL}/colors/${id}`);
  return res.data;
};
