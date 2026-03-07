// src/api/productApi.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ================= PRODUCT =================

// Lấy danh sách sản phẩm
export const getProducts = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = {
      page,
      limit,
      search: filters.search || "",
      category_id: filters.category_id || "",
      brand_id: filters.brand_id || "",
      status: filters.status || "",
    };

    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`${API_URL}/products?${query}`);

    return res.data;
  } catch (error) {
    console.error("Lỗi getProducts:", error);
    throw error;
  }
};

// Lấy chi tiết sản phẩm
export const getProductById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi getProductById:", error);
    throw error;
  }
};

// Tạo sản phẩm
export const createProduct = async (productData) => {
  try {
    const res = await axios.post(`${API_URL}/products`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    console.error("Lỗi createProduct:", error);
    throw error;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    const res = await axios.put(`${API_URL}/products/${id}`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    console.error("Lỗi updateProduct:", error);
    throw error;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi deleteProduct:", error);
    throw error;
  }
};

// ================= VARIANT =================

// 🟢 Tạo 1 biến thể
export const createVariant = async (variantData) => {
  try {
    const res = await axios.post(`${API_URL}/variant`, variantData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    console.error("Lỗi createVariant:", error);
    throw error;
  }
};

// 🟢 Thêm nhiều biến thể
export const updateVariants = async (productId, variants) => {
  try {
    for (const v of variants) {
      const formData = new FormData();

      formData.append("product_id", productId);
      formData.append("name_variant", v.name_variant || "");
      formData.append("color", v.color || "");
      formData.append("power", v.power || "");
      formData.append("connection_type", v.connection_type || "");
      formData.append("has_microphone", v.has_microphone || 0);
      formData.append("price", v.price || 0);
      formData.append("stock", v.stock || 0);

      if (v.image instanceof File) {
        formData.append("image", v.image);
      }

      await axios.post(`${API_URL}/variant`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    return { message: "Thêm biến thể thành công" };
  } catch (error) {
    console.error("Lỗi updateVariants:", error);
    throw error;
  }
};

// 🟢 Sửa biến thể
export const editVariant = async (variantId, variantData) => {
  try {
    const formData = new FormData();

    Object.keys(variantData).forEach((key) => {
      if (key === "image" && variantData[key] instanceof File) {
        formData.append("image", variantData[key]);
      } else {
        formData.append(key, variantData[key]);
      }
    });

    const res = await axios.put(`${API_URL}/variant/${variantId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    console.error("Lỗi editVariant:", error);
    throw error;
  }
};

// 🟢 Xóa biến thể
export const deleteVariant = async (variantId) => {
  try {
    const res = await axios.delete(`${API_URL}/variant/${variantId}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi deleteVariant:", error);
    throw error;
  }
};