// src/api/customerApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// 🟢 Lấy danh sách khách hàng
export const getCustomers = async (token, page = 1, limit = 10) => {
  try {
    const res = await axios.get(`${API_URL}/customers?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi getCustomers:", error);
    throw error;
  }
};
// 🟢 Lấy chi tiết khách hàng
export const getCustomerById = async (id) => {
  const res = await axios.get(`${API_URL}/customers/${id}`);
  return res.data;
};
// 🟢 Cập nhật trạng thái
export const updateCustomerStatus = async (id, status) => {
  try {
    const res = await axios.put(`${API_URL}/customers/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error("Lỗi updateCustomerStatus:", error);
    throw error;
  }
};

// 🟢 Xóa khách hàng
export const deleteCustomer = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/customers/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi deleteCustomer:", error);
    throw error;
  }
};
