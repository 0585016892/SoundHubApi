// src/api/statisApi.js
import axios from "axios";
const API_URL = "http://localhost:5000/api";

// Doanh thu
export const getRevenue = async (type = "day", start_date, end_date) => {
  try {
    const res = await axios.get(`${API_URL}/statistics/revenue`, {
      params: { type, start_date, end_date }
    });
    console.log(res);
    
    return res.data;
  } catch (error) {
    console.error("Lỗi getRevenue:", error);
    throw error;
  }
};

// Top sản phẩm
export const getTopProducts = async (start_date, end_date, limit = 5) => {
  try {
    const res = await axios.get(`${API_URL}/statistics/top-products`, {
      params: { start_date, end_date, limit }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi getTopProducts:", error);
    throw error;
  }
};

// Khách hàng mới & trung thành
export const getCustomers = async (start_date, end_date) => {
  try {
    const res = await axios.get(`${API_URL}/statistics/customers`, {
      params: { start_date, end_date }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi getCustomers:", error);
    throw error;
  }
};

// Sản phẩm tồn kho thấp
export const getLowStock = async (threshold = 10) => {
  try {
    const res = await axios.get(`${API_URL}/statistics/stock`, {
      params: { threshold }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi getLowStock:", error);
    throw error;
  }
};

// Thống kê coupon
export const getCoupons = async (start_date, end_date) => {
  try {
    const res = await axios.get(`${API_URL}/statistics/coupons`, {
      params: { start_date, end_date }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi getCoupons:", error);
    throw error;
  }
};
