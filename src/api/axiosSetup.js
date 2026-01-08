// src/api/axiosSetup.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // nếu bạn dùng cookie auth
});

// Thêm interceptor gửi token nếu có (token đã set vào axios.defaults trong Context)
// xử lý 401 chung:
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // có thể dispatch logout global ở đây (hoặc emit event)
      // window.location = '/login'; // hoặc dùng logic react để logout
    }
    return Promise.reject(err);
  }
);

export default api;
