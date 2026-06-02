import React, { useState, useContext, useEffect } from "react";
import {
  Layout,
  Badge,
  Dropdown,
  Avatar,
  List,
  Typography,
  Button,
  Space,
  ConfigProvider,
  theme,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FullscreenOutlined,
  SoundOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { UserContext } from "../context/UserContext.js";
import {
  connectNotificationSocket,
  fetchUnreadNotifications,
  markNotificationAsRead,
} from "../utils/notificationSocket.js";
import logo from "../assets/img/logo2.png";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const socket = connectNotificationSocket(user.id, user.role === "admin");

    socket.on("connect", () => {
      fetchUnreadNotifications(user.id);
      socket.on("unreadNotifications", (notifs) => setNotifications(notifs));
      socket.on("newNotification", (notif) =>
        setNotifications((prev) => [notif, ...prev]),
      );
    });

    return () => {
      socket.off("connect");
      socket.off("unreadNotifications");
      socket.off("newNotification");
    };
  }, [user]);

  const handleMarkAsRead = (id) => {
    markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
    );
  };

  // Content cho Dropdown Thông báo dạng Studio Box
  const notificationContent = (
    <div className="studio-notification-dropdown">
      <div className="notif-dropdown-header">
        <div className="header-left">
          <InfoCircleOutlined className="title-icon" />
          <Text className="title-txt">THÔNG BÁO HỆ THỐNG</Text>
        </div>
        <Badge
          count={notifications.filter((n) => !n.is_read).length}
          size="small"
          className="studio-notif-badge"
        />
      </div>

      <List
        dataSource={notifications}
        locale={{
          emptyText: (
            <div className="empty-notif-box">
              <SoundOutlined className="empty-icon" />
              <Text className="empty-txt">HỆ THỐNG HIỆN TẠI ỔN ĐỊNH</Text>
            </div>
          ),
        }}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleMarkAsRead(item.id)}
            className={`studio-notif-item ${item.is_read ? "read" : "unread"}`}
          >
            <div className="notif-item-wrapper">
              <div className="notif-meta-line">
                <Text className="notif-item-title">
                  {item.title?.toUpperCase()}
                </Text>
                <Text className="notif-item-time">
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>
              <div className="notif-item-content">{item.content}</div>
            </div>
          </List.Item>
        )}
        className="notif-scroll-viewport"
      />

      <div className="notif-dropdown-footer">
        <Button type="link" size="small" className="btn-view-all-notif">
          XEM TOÀN BỘ LOG CHUYÊN SÂU
        </Button>
      </div>
    </div>
  );

  // Menu cho Profile đồng bộ Dark-Studio
  const profileMenu = {
    items: [
      {
        key: "1",
        label: "Hồ sơ chuyên viên",
        icon: <UserOutlined style={{ fontSize: 13 }} />,
        onClick: () => (window.location.href = "/profile"),
      },
      {
        key: "2",
        label: "Cấu hình hệ thống",
        icon: <SettingOutlined style={{ fontSize: 13 }} />,
      },
      { type: "divider" },
      {
        key: "3",
        label: "Ngắt kết nối (Đăng xuất)",
        icon: <LogoutOutlined style={{ fontSize: 13 }} />,
        danger: true,
        onClick: logout,
      },
    ],
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#ff6600",
          colorBgContainer: "#111111",
          colorText: "#ffffff",
          colorBorder: "#1a1a1a",
        },
      }}
    >
      <AntHeader className="studio-global-header">
        {/* VÙNG TRÁI: ĐỊNH DANH PANEL */}
        <Space size="middle" className="header-left-brand">
          <div className="brand-icon-wrapper">
            <SoundOutlined className="brand-core-icon" />
          </div>
          <div className="brand-text-block">
            <span className="brand-main-title">TCD AUDIO</span>
            <span className="brand-sub-role">
              NODE CORE{" "}
              <span className="role-highlight">
                {user?.role?.toUpperCase()} ACCESS
              </span>
            </span>
          </div>
        </Space>

        {/* VÙNG PHẢI: KHỐI CHỨC NĂNG BENTO */}
        <Space size={14} className="header-right-actions">
          {/* Nút Toàn màn hình */}
          <Button
            type="text"
            icon={<FullscreenOutlined className="action-btn-icon" />}
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else if (document.exitFullscreen) {
                document.exitFullscreen();
              }
            }}
            className="studio-action-trigger"
          />

          {/* Khối Dropdown Thông báo */}
          <Dropdown
            dropdownRender={() => notificationContent}
            trigger={["click"]}
            placement="bottomRight"
            popupClassName="notif-dropdown-portal"
          >
            <div className="studio-action-trigger notif-bell-wrapper">
              <Badge
                count={notifications.filter((n) => !n.is_read).length}
                offset={[2, -2]}
                size="small"
                className="bell-badge-core"
              >
                <BellOutlined className="action-btn-icon" />
              </Badge>
            </div>
          </Dropdown>

          <div className="action-divider-line" />

          {/* Thông tin thực thể User Profile */}
          <Dropdown
            menu={profileMenu}
            trigger={["click"]}
            placement="bottomRight"
            popupClassName="profile-dropdown-portal"
          >
            <Space className="studio-profile-trigger">
              <div className="user-text-meta">
                <span className="user-display-name">
                  {user?.full_name || "Chuyên viên"}
                </span>
                <span className="user-status-pulse">
                  <span className="pulse-dot" /> Đang hoạt động
                </span>
              </div>
              <div className="avatar-secure-frame">
                <Avatar
                  src={user?.avatar || logo}
                  icon={<UserOutlined />}
                  className="avatar-core"
                />
              </div>
            </Space>
          </Dropdown>
        </Space>

        <style>{`
          /* Tinh chỉnh Header Core */
          .studio-global-header {
            background: rgba(10, 10, 10, 0.75) !important;
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            padding: 0 30px !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #161616 !important;
            position: sticky;
            top: 0;
            zIndex: 999;
            height: 70px !important;
            font-family: 'Inter', sans-serif;
          }

          /* Thương hiệu bên trái */
          .brand-icon-wrapper {
            background: rgba(255, 102, 0, 0.05);
            border: 1px solid rgba(255, 102, 0, 0.15);
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .brand-core-icon {
            color: #ff6600;
            font-size: 16px;
            filter: drop-shadow(0 0 8px rgba(255,102,0,0.4));
          }
          .brand-text-block {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
          }
          .brand-main-title {
            color: #fff;
            font-weight: 900;
            font-size: 14px;
            letter-spacing: -0.3px;
          }
          .brand-sub-role {
            color: #444;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-top: 1px;
          }
          .role-highlight {
            color: #ff6600;
          }

          /* Khối chức năng bên phải */
          .studio-action-trigger {
            width: 38px;
            height: 38px;
            border: 1px solid #161616 !important;
            background: #111 !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0 !important;
          }
          .studio-action-trigger:hover {
            border-color: #262626 !important;
            background: #141414 !important;
          }
          .action-btn-icon {
            color: #888 !important;
            font-size: 16px !important;
            transition: color 0.2s;
          }
          .studio-action-trigger:hover .action-btn-icon {
            color: #fff !important;
          }
          .notif-bell-wrapper {
            position: relative;
          }
          .bell-badge-core .ant-badge-count {
            background: #ff6600 !important;
            box-shadow: 0 0 8px rgba(255, 102, 0, 0.5) !important;
            color: #fff !important;
            font-weight: 800;
            border: none !important;
          }

          .action-divider-line {
            width: 1px;
            height: 20px;
            background: #1c1c1c;
            margin: 0 4px;
          }

          /* Vùng kích hoạt thông tin người dùng */
          .studio-profile-trigger {
            cursor: pointer;
            padding: 4px 6px 4px 14px;
            border-radius: 12px;
            background: #111;
            border: 1px solid #161616;
            transition: all 0.2s ease;
          }
          .studio-profile-trigger:hover {
            border-color: #222;
            background: #131313;
          }
          .user-text-meta {
            display: flex;
            flex-direction: column;
            text-align: right;
            line-height: 1.2;
          }
          .user-display-name {
            color: #fff;
            font-weight: 800;
            font-size: 13px;
            letter-spacing: -0.2px;
          }
          .user-status-pulse {
            color: #444;
            font-size: 9px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 5px;
            margin-top: 2px;
            letter-spacing: 0.5px;
          }
          .pulse-dot {
            width: 5px;
            height: 5px;
            background: #22c55e;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 6px #22c55e;
          }
          .avatar-secure-frame {
            border: 1px solid #222;
            padding: 3px;
            border-radius: 9px;
            background: #161616;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .avatar-core {
            border: 1px solid rgba(255, 102, 0, 0.4) !important;
            background: #262626 !important;
            width: 26px !important;
            height: 26px !important;
          }

          /* Dropdown Cấu trúc thông báo hệ thống */
          .studio-notification-dropdown {
            width: 360px;
            background-color: #0e0e0e !important;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.6);
            border: 1px solid #1c1c1c;
            overflow: hidden;
          }
          .notif-dropdown-header {
            padding: 16px 20px;
            border-bottom: 1px solid #161616;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #121212;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .title-icon {
            color: #ff6600;
            font-size: 13px;
          }
          .title-txt {
            color: #666 !important;
            font-weight: 800 !important;
            font-size: 11px !important;
            letter-spacing: 1px;
          }
          .studio-notif-badge .ant-badge-count {
            background: #ff6600;
            color: #fff;
            border: none;
            font-weight: 700;
          }

          /* Viewport danh sách cuộn thông báo */
          .notif-scroll-viewport {
            max-height: 380px;
            overflow-y: auto;
          }
          .studio-notif-item {
            padding: 14px 20px !important;
            border-bottom: 1px solid #131313 !important;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .studio-notif-item.unread {
            background-color: rgba(255, 102, 0, 0.02);
            border-left: 2px solid #ff6600;
          }
          .studio-notif-item.read {
            border-left: 2px solid transparent;
          }
          .studio-notif-item:hover {
            background-color: #141414 !important;
          }
          .notif-item-wrapper {
            width: 100%;
          }
          .notif-meta-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .notif-item-title {
            font-weight: 800;
            font-size: 12px;
            letter-spacing: -0.1px;
          }
          .studio-notif-item.unread .notif-item-title { color: #fff; }
          .studio-notif-item.read .notif-item-title { color: #555; }
          
          .notif-item-time {
            color: #333;
            font-size: 10px;
            font-family: 'Space Mono', monospace;
            font-weight: 600;
          }
          .notif-item-content {
            color: #888;
            font-size: 12px;
            line-height: 1.5;
            margin-top: 4px;
          }

          .notif-dropdown-footer {
            padding: 10px;
            text-align: center;
            border-top: 1px solid #161616;
            background: #121212;
          }
          .btn-view-all-notif {
            color: #ff6600 !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            letter-spacing: 0.5px;
          }

          /* Giao diện trống rỗng (Empty state) */
          .empty-notif-box {
            padding: 40px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .empty-icon {
            font-size: 18px;
            color: #222;
          }
          .empty-txt {
            color: #444 !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            letter-spacing: 1px;
          }

          /* Portal Menu Thả Xuống của Thực thể Cá Nhân */
          .profile-dropdown-portal .ant-dropdown-menu {
            background-color: #0e0e0e !important;
            border: 1px solid #1c1c1c !important;
            border-radius: 14px !important;
            padding: 6px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
          }
          .profile-dropdown-portal .ant-dropdown-menu-item {
            color: #888 !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            padding: 10px 14px !important;
            border-radius: 8px !important;
          }
          .profile-dropdown-portal .ant-dropdown-menu-item:hover {
            background-color: #161616 !important;
            color: #fff !important;
          }
          .profile-dropdown-portal .ant-dropdown-menu-item-danger:hover {
            background-color: rgba(239, 68, 68, 0.08) !important;
            color: #ef4444 !important;
          }
          .profile-dropdown-portal .ant-dropdown-menu-submenu-title {
            color: #888 !important;
          }
          .profile-dropdown-portal .ant-dropdown-menu-divider {
            background-color: #161616 !important;
            margin: 4px 0 !important;
          }
        `}</style>
      </AntHeader>
    </ConfigProvider>
  );
};

export default Header;
