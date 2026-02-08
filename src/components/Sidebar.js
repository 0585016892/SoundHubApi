import React, { useState } from "react";
import { Layout, Menu, Typography, ConfigProvider } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo2.png";

// Antd icons chuyên nghiệp hơn
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ContainerOutlined,
  PercentageOutlined,
  MessageOutlined,
  BarChartOutlined,
  ControlOutlined,
  SkinOutlined,
  AppstoreAddOutlined,
  PartitionOutlined
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

// ✅ Cấu trúc menu giữ nguyên logic của bạn nhưng thay icon phù hợp audio/tech
const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "products",
    icon: <ControlOutlined />, // Icon bảng điều khiển mixer
    label: "Quản lý âm thanh",
    children: [
      { key: "/products/danh-sach", icon: <ShoppingOutlined />, label: "Danh sách sản phẩm" },
      { key: "/products/colors", icon: <SkinOutlined />, label: "Quản lý màu" },
      { key: "/products/category", icon: <PartitionOutlined />, label: "Quản lý danh mục" },
      { key: "/products/brands", icon: <AppstoreAddOutlined />, label: "Quản lý thương hiệu" },
    ],
  },
  { key: "/customers/danh-sach", icon: <UserOutlined />, label: "Khách hàng" },
  { key: "/orders", icon: <ContainerOutlined />, label: "Đơn hàng" },
  { key: "/coupons/danh-sach", icon: <PercentageOutlined />, label: "Mã giảm giá" },
  { key: "/messages", icon: <MessageOutlined />, label: "Tin nhắn" },
  {
    key: "employees",
    icon: <UserOutlined />,
    label: "Nhân sự hệ thống",
    children: [{ key: "/employees/danh-sach", label: "Danh sách nhân viên" }],
  },
  { key: "/statistics", icon: <BarChartOutlined />, label: "Báo cáo doanh thu" },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onMenuClick = ({ key }) => {
    if (key.startsWith("/")) navigate(key);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemBg: "transparent",
            itemColor: "#a6a6a6",
            itemSelectedColor: "#fff",
            itemSelectedBg: "rgba(255, 102, 0, 0.15)", // Cam mờ
            itemHoverColor: "#ff6600",
            itemActiveBg: "#ff6600",
            subMenuBg: "rgba(0,0,0,0.2)",
            itemBorderRadius: 8,
          },
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#111111", // Đen sâu Matte
          borderRight: "1px solid #222",
          zIndex: 1000
        }}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: collapsed ? "20px 0" : "24px", 
          textAlign: "center",
          transition: "all 0.3s",
          borderBottom: "1px solid #222",
          marginBottom: 10
        }}>
          <img 
            src={logo} 
            alt="logo" 
            style={{ 
                width: collapsed ? 35 : 45, 
                filter: "drop-shadow(0 0 8px rgba(255,102,0,0.4))" 
            }} 
          />
          {!collapsed && (
            <div style={{ marginTop: 10 }}>
              <Text style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>
                SOUND<span style={{ color: "#ff6600" }}>HUB</span>
              </Text>
              <br />
              <Text style={{ color: "#444", fontSize: 10, textTransform: "uppercase" }}>
                Admin Dashboard
              </Text>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["products", "employees"]}
          onClick={onMenuClick}
          items={menuItems}
          style={{ padding: "0 12px", borderRight: 0 }}
        />

        {/* CSS để làm đẹp Menu Antd Dark */}
        <style>{`
          .ant-menu-submenu-title:hover { color: #ff6600 !important; }
          .ant-menu-item-selected::after {
            border-right: 3px solid #ff6600 !important;
            left: 0;
            right: auto;
          }
          .ant-layout-sider-trigger {
            background: #1a1a1a !important;
            border-top: 1px solid #222;
          }
        `}</style>
      </Sider>
    </ConfigProvider>
  );
};

export default Sidebar;