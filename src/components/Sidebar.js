import React from "react";
import { Layout, Menu, Typography, ConfigProvider } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo2.png";

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

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "products",
    icon: <ControlOutlined />,
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
            darkItemBg: "transparent",
            itemBg: "transparent",
            itemColor: "rgba(255, 255, 255, 0.65)",
            itemSelectedColor: "#fff",
            itemSelectedBg: "rgba(255, 102, 0, 0.2)", 
            itemHoverColor: "#ff6600",
            itemActiveBg: "#ff6600",
            subMenuBg: "rgba(255, 255, 255, 0.03)",
            itemBorderRadius: 8,
          },
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        breakpoint="lg"
        className="custom-sidebar"
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#0f0f0f", 
          borderRight: "1px solid #222",
          zIndex: 1000,
        }}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: collapsed ? "20px 0" : "24px 16px", 
          textAlign: "center",
          borderBottom: "1px solid #222",
          marginBottom: 10,
          overflow: 'hidden'
        }}>
          <img 
            src={logo} 
            alt="logo" 
            style={{ 
                width: collapsed ? 30 : 40, 
                transition: "all 0.3s",
                filter: "drop-shadow(0 0 10px rgba(255,102,0,0.3))" 
            }} 
          />
          {!collapsed && (
            <div style={{ marginTop: 12 }}>
              <Text style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: 1.5 }}>
                SOUND<span style={{ color: "#ff6600" }}>HUB</span>
              </Text>
              <br />
              <Text style={{ color: "#555", fontSize: 9, textTransform: "uppercase", fontWeight: 600 }}>
                High-End Audio Admin
              </Text>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["products"]}
          onClick={onMenuClick}
          items={menuItems}
          style={{ padding: "0 10px", borderRight: 0, background: 'transparent' }}
        />

        {/* CSS Tùy chỉnh thanh cuộn và hiệu ứng */}
        <style>{`
         
        `}</style>
      </Sider>
    </ConfigProvider>
  );
};

export default Sidebar;