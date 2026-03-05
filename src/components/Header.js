import React, { useState, useContext, useEffect } from 'react';
import { Layout, Badge, Dropdown, Avatar, List, Typography, Button, Space, ConfigProvider } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  FullscreenOutlined,
  SoundOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { UserContext } from "../context/UserContext.js";
import { connectNotificationSocket, fetchUnreadNotifications, markNotificationAsRead } from '../utils/notificationSocket.js';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const socket = connectNotificationSocket(user.id, user.role === 'admin');
    
    socket.on("connect", () => {
      fetchUnreadNotifications(user.id);
      socket.on("unreadNotifications", (notifs) => setNotifications(notifs));
      socket.on("newNotification", (notif) => setNotifications(prev => [notif, ...prev]));
    });

    return () => {
      socket.off("connect");
      socket.off("unreadNotifications");
      socket.off("newNotification");
    };
  }, [user]);

  const handleMarkAsRead = (id) => {
    markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };

  // Content cho Dropdown Thông báo
  const notificationContent = (
    <div style={{ 
      width: 350, 
      backgroundColor: '#1f1f1f', 
      borderRadius: '12px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
      border: '1px solid #333'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #333', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong style={{ color: '#fff' }}>Thông báo hệ thống</Text>
        <Badge count={notifications.filter(n => !n.is_read).length} size="small" />
      </div>
      <List
        dataSource={notifications}
        locale={{ emptyText: <Text style={{ color: '#666', padding: 20, display: 'block', textAlign: 'center' }}>Không có thông báo mới</Text> }}
        renderItem={(item) => (
          <List.Item 
            onClick={() => handleMarkAsRead(item.id)}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer',
              backgroundColor: item.is_read ? 'transparent' : 'rgba(255, 102, 0, 0.05)',
              borderLeft: item.is_read ? 'none' : '3px solid #ff6600',
              transition: 'all 0.3s'
            }}
            className="notif-item"
          >
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', width: '100%' }}>
                <Text strong style={{ color: item.is_read ? '#aaa' : '#fff', fontSize: '13px' }}>{item.title}</Text>
                <Text style={{ color: '#555', fontSize: '11px', marginLeft: 'auto' }}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
              <div style={{ color: '#888', fontSize: '12px', marginTop: 4 }}>{item.content}</div>
            </div>
          </List.Item>
        )}
        style={{ maxHeight: 400, overflowY: 'auto' }}
      />
      <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #333' }}>
        <Button type="link" size="small" style={{ color: '#ff6600' }}>Xem tất cả</Button>
      </div>
    </div>
  );

  // Menu cho Profile
  const profileMenu = {
    items: [
      { key: '1', label: 'Trang cá nhân', icon: <UserOutlined />, onClick: () => window.location.href = '/profile' },
      { key: '2', label: 'Cài đặt hệ thống', icon: <SettingOutlined /> },
      { type: 'divider' },
      { key: '3', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: logout },
    ],
  };

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#ff6600' },
      }}
    >
      <AntHeader style={{ 
        background: 'rgba(10, 10, 10, 0.8)', 
        backdropFilter: 'blur(10px)',
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #222',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        height: '70px'
      }}>
        {/* Left Side: Breadcrumb or Search */}
        <Space size="middle">
          <SoundOutlined style={{ color: '#ff6600', fontSize: '20px' }} />
          <Text style={{ color: '#fff', fontSize: '16px', fontWeight: 600, letterSpacing: 0.5 }}>
            BẢNG ĐIỀU KHIỂN <span style={{ color: '#ff6600', fontWeight: 400 }}>| {user?.role?.toUpperCase()}</span>
          </Text>
        </Space>

        {/* Right Side: Actions */}
        <Space size={24}>
          <Button 
            type="text" 
            icon={<FullscreenOutlined style={{ color: '#fff' }} />} 
            onClick={() => document.documentElement.requestFullscreen()}
            className="header-btn"
          />

          {/* Notification */}
          <Dropdown dropdownRender={() => notificationContent} trigger={['click']} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Badge count={notifications.filter(n => !n.is_read).length} offset={[2, 2]} size="small">
                <BellOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </Badge>
            </div>
          </Dropdown>

          {/* User Profile */}
          <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }} className="profile-hover">
              <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{user?.full_name}</div>
                <div style={{ color: '#666', fontSize: '11px' }}>Online</div>
              </div>
              <Avatar 
                src={user?.avatar || "https://api.dicebear.com/7.x/miniavs/svg?seed=1"} 
                style={{ border: '2px solid #ff6600', backgroundColor: '#333' }}
                icon={<UserOutlined />}
              />
            </Space>
          </Dropdown>
        </Space>

        <style>{`
          .header-btn:hover { background: rgba(255,255,255,0.05) !important; }
          .profile-hover:hover { background: rgba(255,255,255,0.05); }
          .notif-item:hover { background-color: rgba(255, 102, 0, 0.1) !important; }
          .ant-dropdown-menu { background-color: #1f1f1f !important; border: 1px solid #333 !important; }
          .ant-dropdown-menu-item { color: #ccc !important; }
          .ant-dropdown-menu-item:hover { background-color: #262626 !important; color: #ff6600 !important; }
          .ant-dropdown-menu-item-danger:hover { background-color: #2a1215 !important; color: #ff4d4f !important; }
        `}</style>
      </AntHeader>
    </ConfigProvider>
  );
};

export default Header;