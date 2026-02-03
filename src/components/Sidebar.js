import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo2.png";

// Antd icons
import {
  DashboardOutlined,
  AppstoreOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  MailOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

// ✅ Map icon React-icons → Antd icon
const iconMap = {
  Dashboard: <DashboardOutlined />,
  Product: <AppstoreOutlined />,
  User: <UserOutlined />,
  Order: <ShoppingCartOutlined />,
  Coupon: <TagOutlined />,
  Message: <MailOutlined />,
  Report: <BarChartOutlined />,
};

// ✅ Menu config (GIỮ LOGIC như m)
const menuItems = [
  { key: "/", icon: iconMap.Dashboard, label: "Dashboard", link: "/" },

  {
    key: "products",
    icon: iconMap.Product,
    label: "Quản lý sản phẩm",
    children: [
      { key: "/products/danh-sach", label: "Danh sách sản phẩm", link: "/products/danh-sach" },
      { key: "/products/colors", label: "Quản lý màu", link: "/products/colors" },
      { key: "/products/category", label: "Quản lý danh mục", link: "/products/category" },
      { key: "/products/brands", label: "Quản lý thương hiệu", link: "/products/brands" },
    ],
  },

  { key: "/customers/danh-sach", icon: iconMap.User, label: "Khách hàng", link: "/customers/danh-sach" },
  { key: "/orders", icon: iconMap.Order, label: "Đơn hàng", link: "/orders" },
  { key: "/coupons/danh-sach", icon: iconMap.Coupon, label: "Mã giảm giá", link: "/coupons/danh-sach" },
  { key: "/messages", icon: iconMap.Message, label: "Tin nhắn", link: "/messages" },

  {
    key: "employees",
    icon: iconMap.User,
    label: "Quản lý nhân viên",
    children: [{ key: "/employees/danh-sach", label: "Danh sách nhân viên", link: "/employees/danh-sach" }],
  },

  { key: "/statistics", icon: iconMap.Report, label: "Thống kê báo cáo", link: "/statistics" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Click menu → navigate
  const onMenuClick = ({ key }) => {
    if (key.startsWith("/")) navigate(key);
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" width={260}>
      {/* Logo */}
      <div style={{ padding: 16, display: "flex", alignItems: "center" }}>
        <img src={logo} alt="logo" style={{ width: 40 }} />
        {!collapsed && <span style={{ marginLeft: 10, fontWeight: "bold" }}>SoundHub Admin</span>}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["products", "employees"]}
        onClick={onMenuClick}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
