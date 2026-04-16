import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Layout } from 'antd';

const { Content } = Layout;

const AdminLayout = () => {
  // Trạng thái collapsed để tính toán khoảng cách nội dung (margin-left)
  const [collapsed, setCollapsed] = useState(false);

  // Độ rộng sidebar tương ứng với trạng thái đóng/mở
  const sidebarWidth = collapsed ? 80 : 280;

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Sidebar - Truyền state để đồng bộ layout */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout 
        style={{ 
          marginLeft: sidebarWidth, 
          transition: 'all 0.2s', 
          background: '#0a0a0a',
          minHeight: '100vh'
        }}
      >
        {/* Header - Sticky đã được xử lý trong component Header */}
        <Header />

        <Content
          style={{
            padding: '24px',
            margin: 0,
            minHeight: '280px',
            background: '#0d0d0d', // Nền nội dung hơi sáng hơn nền tổng thể một chút
            backgroundImage: 'radial-gradient(circle at top right, #141414 0%, #0d0d0d 100%)',
            overflow: 'initial',
          }}
        >
          {/* Khu vực render các trang con (Dashboard, Products, v.v.) */}
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>

        {/* Footer nhỏ (Tùy chọn) */}
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#444', 
          background: '#0d0d0d',
          borderTop: '1px solid #1a1a1a'
        }}>
          TCD AUDIO Admin ©2026 - Engineered for High Fidelity Management
        </footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;