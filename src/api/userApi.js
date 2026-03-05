// src/api/userApi.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // đổi theo URL backend của bạn


// Cập nhật thông tin cá nhân
export const updateProfile = async (id,data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/employees/${id}/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Đổi mật khẩu
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const token = localStorage.getItem("token"); // token từ login
    const res = await axios.put(
      `${API_URL}/employees/change-password`,
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    // Lấy message trả về từ server nếu có
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Đổi mật khẩu thất bại");
  }
};

// Logout (xóa localStorage hoặc gọi API)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
