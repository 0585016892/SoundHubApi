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
  AppstoreAddOutlined,
  PartitionOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    label: <Text className="menu-group-label">HỆ THỐNG</Text>,
    type: "group",
  },
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard Overview" },
  {
    key: "products",
    icon: <ControlOutlined />,
    label: "Quản lý âm thanh",
    children: [
      {
        key: "/products/danh-sach",
        icon: <ShoppingOutlined />,
        label: "Kho sản phẩm",
      },
      {
        key: "/products/category",
        icon: <PartitionOutlined />,
        label: "Danh mục thiết bị",
      },
      {
        key: "/products/brands",
        icon: <AppstoreAddOutlined />,
        label: "Thương hiệu đối tác",
      },
    ],
  },
  {
    label: <Text className="menu-group-label">GIAO DỊCH</Text>,
    type: "group",
  },
  { key: "/customers/danh-sach", icon: <UserOutlined />, label: "Khách hàng" },
  { key: "/orders", icon: <ContainerOutlined />, label: "Quản lý đơn hàng" },
  {
    key: "/coupons/danh-sach",
    icon: <PercentageOutlined />,
    label: "Chiến dịch ưu đãi",
  },
  {
    label: <Text className="menu-group-label">VẬN HÀNH</Text>,
    type: "group",
  },
  { key: "/messages", icon: <MessageOutlined />, label: "Tin nhắn" },
  {
    key: "employees",
    icon: <UserOutlined />,
    label: "Nhân sự",
    children: [
      { key: "/employees/danh-sach", label: "Danh sách quản trị viên" },
    ],
  },
  {
    key: "/statistics",
    icon: <BarChartOutlined />,
    label: "Phân tích tài chính",
  },
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
            itemColor: "#888888",
            itemSelectedColor: "#ffffff",
            itemSelectedBg: "rgba(255, 102, 0, 0.15)",
            itemHoverColor: "#ff6600",
            itemActiveBg: "transparent",
            subMenuBg: "rgba(0, 0, 0, 0.2)",
            itemBorderRadius: 4,
            itemMarginInline: 12,
            itemMarginBlock: 4,
          },
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        collapsedWidth={80}
        breakpoint="lg"
        className="custom-sidebar"
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#080808",
          borderRight: "1px solid #1a1a1a",
          zIndex: 1000,
          transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* Logo Section */}
        <div className="sidebar-logo-container">
          <div className="logo-glow-wrapper">
            <img
              src={logo}
              alt="logo"
              style={{ width: collapsed ? 32 : 42 }}
              className="logo-img"
            />
          </div>
          {!collapsed && (
            <div className="brand-text-wrapper">
              <Text className="brand-main-text">
                TCD<span className="brand-accent-text">AUDIO</span>
              </Text>
              <Text className="brand-sub-text">SOUND ENGINE v2.0</Text>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <div className="menu-scroll-container">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["products"]}
            onClick={onMenuClick}
            items={menuItems}
            className="modern-menu"
          />
        </div>

        {/* Bottom Actions */}
        <div className="sidebar-footer">
          <Menu
            theme="dark"
            mode="inline"
            selectable={false}
            items={[
              {
                key: "logout",
                icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
                label: collapsed ? "" : "Đăng xuất",
              },
            ]}
            className="footer-menu"
          />
        </div>

        <style>{`
          .custom-sidebar .ant-layout-sider-trigger {
            background: #111 !important;
            border-top: 1px solid #222;
            color: #ff6600;
          }

          .sidebar-logo-container {
            height: 120px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 0;
            border-bottom: 1px dashed #222;
            margin-bottom: 10px;
          }

          .logo-glow-wrapper {
            position: relative;
            z-index: 1;
          }

          .logo-img {
            transition: all 0.5s ease;
            filter: drop-shadow(0 0 8px rgba(255, 102, 0, 0.2));
          }

          .brand-text-wrapper {
            margin-top: 10px;
            text-align: center;
            animation: fadeIn 0.5s ease forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .brand-main-text {
            color: #fff;
            font-weight: 900;
            font-size: 18px;
            letter-spacing: 2px;
            font-family: 'Inter', sans-serif;
          }

          .brand-accent-text {
            color: #ff6600;
            text-shadow: 0 0 15px rgba(255, 102, 0, 0.4);
          }

          .brand-sub-text {
            display: block;
            color: #444;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-top: -4px;
          }

          /* Menu Styling */
          .menu-group-label {
            color: #fff !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            letter-spacing: 1.5px;
            margin-left: 10px;
          }

          .menu-scroll-container {
            height: calc(100vh - 250px);
            overflow-y: auto;
            overflow-x: hidden;
          }

          /* Tùy chỉnh thanh cuộn */
          .menu-scroll-container::-webkit-scrollbar {
            width: 4px;
          }
          .menu-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .menu-scroll-container::-webkit-scrollbar-thumb {
            background: #1a1a1a;
            border-radius: 10px;
          }
          .menu-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #222;
          }

          .modern-menu {
            border-right: none !important;
          }

          .ant-menu-item {
            font-weight: 600 !important;
            font-size: 13px !important;
          }

          .ant-menu-item-selected {
            background: linear-gradient(90deg, rgba(255, 102, 0, 0.1) 0%, rgba(255, 102, 0, 0) 100%) !important;
            border-left: 3px solid #ff6600;
            border-radius: 0 4px 4px 0 !important;
          }

          .ant-menu-submenu-title {
             font-weight: 600 !important;
          }

          /* Footer */
          .sidebar-footer {
            position: absolute;
            bottom: 48px;
            width: 100%;
            border-top: 1px solid #1a1a1a;
            padding-top: 10px;
            background: #080808;
          }

          .footer-menu .ant-menu-item {
            margin-block: 2px !important;
            height: 35px !important;
            line-height: 35px !important;
          }
        `}</style>
      </Sider>
    </ConfigProvider>
  );
};

export default Sidebar;
