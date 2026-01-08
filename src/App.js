import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './pages/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import EmployeeList from './components/EmployeeList';
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import CustomerList from "./components/CustomerList";
import CouponPage from './components/CouponPage';
import BrandPage from './components/BrandPage';
import CategoryPage from './components/CategoryPage';
import OrderPage from './pages/OrderPage';
import ColorPage from './components/ColorPage';
import ProfilePage from './components/ProfilePage';
import AdminChat from './components/AdminChat';
import StatisticsPage from './components/StatisticsPage';
import ProductDetail from './components/ProductDetail';

function App() {
  return (
    <div>
      <div> <Toaster position="bpttom-left"  reverseOrder={false} /></div>
 <Routes>
      {/* Trang login */}
      <Route path="/login" element={<Login />} />

      {/* Admin layout */}
      <Route path="/" element={
        <ProtectedRoute roles={["admin", "staff"]}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="products/danh-sach" element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="/products/colors" element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <ColorPage />
          </ProtectedRoute>
        } />
        <Route path="/products/brands" element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <BrandPage />
          </ProtectedRoute>
        } />
         <Route path="products/category" element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <CategoryPage />
          </ProtectedRoute>
        } />
        <Route path="employees/danh-sach" element={
          <ProtectedRoute roles={["admin"]}> {/* Chỉ admin mới được xem nhân viên */}
            <EmployeeList />
          </ProtectedRoute>
        } />
        <Route
          path="customers/danh-sach"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <CustomerList />
            </ProtectedRoute>
          }
        />
         <Route
          path="coupons/danh-sach"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CouponPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute roles={["admin"]}>
              <OrderPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/messages"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <AdminChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/productDetail/:id" element={<ProductDetail />} />
        {/* Redirect nếu truy cập path gốc */}
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Redirect tất cả các path không hợp lệ về login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </div>
   
  );
}

export default App;
