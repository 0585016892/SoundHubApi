// src/api/brandApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

/**
 * Lấy danh sách thương hiệu
 * @returns {Promise<Array>}
 */
export const getBrands = async () => {
  try {
    const res = await axios.get(`${API_URL}/brands`);
    return res.data;
  } catch (error) {
    console.error("Lỗi getBrands:", error);
    throw error;
  }
};

// 🟢 Lấy danh sách thương hiệu (có tìm kiếm + phân trang)
export const getBrands1 = async (page = 1, limit = 10, search = "") => {
  const res = await axios.get(`${API_URL}/brands?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
};

// 🟢 Thêm mới
export const createBrand = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/brands`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi API createBrand:", error.response?.data || error.message);
    throw error;
  }
};

// 🟢 Cập nhật
export const updateBrand = async (id, formData) => {
  const res = await axios.put(`${API_URL}/brands/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🟢 Xóa
export const deleteBrand = async (id) => {
  const res = await axios.delete(`${API_URL}/brands/${id}`);
  return res.data;
};
