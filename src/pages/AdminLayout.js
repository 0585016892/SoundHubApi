// src/components/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
  const sidebarWidth = 240; // tương ứng var(--sidebar-width-open)
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: sidebarWidth, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ padding: '20px', flex: 1, background: '#f8f9fa' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
