// src/api/categoryApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

/**
 * Lấy danh sách danh mục
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  try {
    const res = await axios.get(`${API_URL}/category`);
    return res.data;
  } catch (error) {
    console.error("Lỗi getCategories:", error);
    throw error;
  }
};
// 🟢 Lấy danh sách + tìm kiếm + phân trang
export const getCategories1 = async (page = 1, limit = 10, search = "") => {
  const res = await axios.get(`${API_URL}/category`, { params: { page, limit, search } });
  return res.data;
};

// 🟢 Thêm danh mục
export const createCategory = async (formData) => {
  const res = await axios.post(`${API_URL}/category`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🟢 Cập nhật
export const updateCategory = async (id, formData) => {
  const res = await axios.put(`${API_URL}/category/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🟢 Xóa
export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/category/${id}`);
  return res.data;
};