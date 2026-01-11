// src/api/employeeApi.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // URL backend

// Lấy danh sách nhân viên có phân trang
export const getEmployees = async (page = 1, limit = 10, keyword = "") => {
  try {
    const res = await axios.get(`${API_URL}/employees`, {
      params: { page, limit, keyword }
    });
    return res.data; // { total, currentPage, totalPages, employees: [...] }
  } catch (error) {
    console.error("Lỗi getEmployees:", error);
    throw error;
  }
};

// Lấy chi tiết 1 nhân viên theo ID
export const getEmployeeById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/employees/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi getEmployeeById:", error);
    throw error;
  }
};

// Thêm nhân viên mới
export const createEmployee = async (employeeData) => {
  try {
    const res = await axios.post(`${API_URL}/employees`, employeeData);
    return res.data;
  } catch (error) {
    console.error("Lỗi createEmployee:", error);
    throw error;
  }
};

// Cập nhật nhân viên
export const updateEmployee = async (id, employeeData) => {
  try {
    const res = await axios.put(`${API_URL}/employees/${id}`, employeeData);
    return res.data;
  } catch (error) {
    console.error("Lỗi updateEmployee:", error);
    throw error;
  }
};

// Xóa nhân viên
export const deleteEmployee = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/employees/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi deleteEmployee:", error);
    throw error;
  }
};
// 🟢 Cập nhật trạng thái nhân viên
export const updateEmployeeStatus = async (id, status) => {
  try {
    const res = await axios.put(`${API_URL}/employees/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error("Lỗi updateEmployeeStatus:", error);
    throw error;
  }
};
