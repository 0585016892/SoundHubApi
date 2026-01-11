import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo2.png';
import {
  AiOutlineDashboard,
  AiOutlineAppstore,
  AiOutlineUser,
  AiOutlineShoppingCart,
  AiOutlineTag,
  AiOutlineSetting,
  AiOutlineMail,
  AiFillBook 
} from 'react-icons/ai';
import { MdOutlineColorLens, MdBrandingWatermark  } from 'react-icons/md';
import { SlArrowRight,SlArrowDown  } from "react-icons/sl";
import { FaChartBar } from "react-icons/fa";
const menuItems = [
  { icon: AiOutlineDashboard, name: 'Dashboard', link: '/' },
  {
    icon: AiOutlineAppstore,
    name: 'Quản lý sản phẩm',
    submenu: [
        {
        icon: AiOutlineAppstore,
        name: 'Danh sách sản phẩm',
        link: '/products/danh-sach',
      },
      { icon: MdOutlineColorLens, name: 'Quản lý màu', link: '/products/colors' },
      { icon: AiFillBook, name: 'Quản lý danh mục', link: '/products/category' },
      { icon: MdBrandingWatermark , name: 'Quản lý thương hiệu', link: '/products/brands' },
      
    ],
  },
  { icon: AiOutlineUser, name: 'Khách hàng', link: '/customers/danh-sach' },
  { 
    icon: AiOutlineShoppingCart, 
    name: 'Đơn hàng', 
    link: '/orders', 
    // badge: 5 // số đơn chờ xử lý
  },
  { icon: AiOutlineTag, name: 'Mã giảm giá', link: '/coupons/danh-sach' },
  { 
    icon: AiOutlineMail, 
    name: 'Tin nhắn', 
    link: '/messages', 
    // badge: 2 
  },
  { 
    icon: AiOutlineUser, 
    name: 'Quản lý nhân viên', 
    link: '/employees', 
     submenu: [
          { name: 'Danh sách nhân viên', link: '/employees/danh-sach' },
        ],
  },
  { 
    icon: FaChartBar, 
    name: 'Thống kê báo cáo', 
    link: '/statistics', 
  },
];

const SidebarItem = ({ item, isOpen, level = 0, location }) => {
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const hasSubmenu = !!item.submenu;

  const isActive = (link) => location.pathname === link;
  const hasActiveChild = (submenu) => {
    if (!submenu) return false;
    return submenu.some(sub => {
      if (sub.submenu) return hasActiveChild(sub.submenu);
      return isActive(sub.link);
    });
  };

  const toggleSubmenu = () => setOpenSubmenu(!openSubmenu);

  return (
    <div>
      {/* Menu cha */}
      {hasSubmenu ? (
        <div
          className={`sherah-menu-item d-flex align-items-center level-${level} ${hasActiveChild(item.submenu) ? 'active' : ''}`}
          onClick={toggleSubmenu}
        >
          {item.icon && <item.icon className="menu-icon" size={20} />}
          {isOpen && <span className="item-text">{item.name}</span>}
          {isOpen && <span className="arrow-icon ms-auto">{openSubmenu ? <SlArrowDown/> : <SlArrowRight/>}</span>}
        </div>
      ) : (
        <NavLink
          to={item.link}
          className={({ isActive }) => `sherah-menu-item d-flex align-items-center level-${level} ${isActive ? 'active' : ''}`}
        >
          {item.icon && <item.icon className="menu-icon" size={20} />}
          {isOpen && <span className="item-text">{item.name}</span>}
          {item.badge && isOpen && <span className="badge bg-danger ms-auto">{item.badge}</span>}
        </NavLink>
      )}

      {/* Submenu */}
      {hasSubmenu && (openSubmenu || hasActiveChild(item.submenu)) && (
        <div className="submenu">
          {item.submenu.map((sub, i) => (
            <SidebarItem key={i} item={sub} isOpen={isOpen} level={level + 1} location={location} />
          ))}
        </div>
      )}
    </div>
  );
};
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Hamburger mobile */}
      <div className={`sherah-sidebar bg-white shadow-sm ${isOpen ? 'open' : 'closed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo d-flex align-items-center">
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="brand-name fw-bold ms-2">SoundHub Admin</span>
        </div>

        {/* Menu */}
        <nav className="sidebar-nav mt-3">
          {menuItems.map((item, i) => (
            <SidebarItem key={i} item={item} isOpen={isOpen} location={location} />
          ))}
        </nav>

      </div>
    </>
  );
};

export default Sidebar;
