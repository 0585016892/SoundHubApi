// src/api/orderApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getOrders = async (page = 1, limit = 10, search = "") => {
  const res = await axios.get(`${API_URL}/orders`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await axios.get(`${API_URL}/orders/${id}`);
  return res.data;
};

export const updateOrder = async (id, data) => {
  const res = await axios.put(`${API_URL}/orders/${id}/status`, data);
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await axios.delete(`${API_URL}/orders/${id}`);
  return res.data;
};
