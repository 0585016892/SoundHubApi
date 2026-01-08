// src/components/Header.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Navbar, Container, Badge, Dropdown, ListGroup } from 'react-bootstrap';
import logo from '../assets/img/logo.png';
import { 
  MdOutlineDarkMode, 
  MdOutlineFullscreen, 
  MdOutlineChatBubbleOutline,
  MdOutlineNotificationsNone
} from 'react-icons/md'; 
import { UserContext } from "../context/UserContext";
import { connectNotificationSocket, fetchUnreadNotifications, markNotificationAsRead } from '../utils/notificationSocket.js';

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const socket = connectNotificationSocket(user.id, user.role === 'admin');

    // Khi socket connect xong
    socket.on("connect", () => {

      // Lấy thông báo chưa đọc
      fetchUnreadNotifications(user.id);

      // Lắng nghe thông báo chưa đọc từ server
      socket.on("unreadNotifications", (notifs) => {
        setNotifications(notifs);
      });

      // Lắng nghe thông báo mới realtime
      socket.on("newNotification", (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
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

  return (
    <Navbar bg="white" expand="lg" className="px-3 py-2 shadow-sm header-custom">
      <Container fluid className="d-flex justify-content-between align-items-center">

        {/* Logo */}
        <div className="d-flex align-items-center">
          <span className="ms-2 fw-bold fs-5 text-dark">Trang quản trị SoundHub</span>
        </div>

        {/* Right Icons & Profile */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-3 me-3">
            <MdOutlineDarkMode size={24} className="header-icon" style={{ cursor: 'pointer' }} />
            <MdOutlineFullscreen size={24} className="header-icon" style={{ cursor: 'pointer' }} />
            <MdOutlineChatBubbleOutline size={24} className="header-icon" style={{ cursor: 'pointer' }} />

            {/* Notification Dropdown */}
            <Dropdown show={showNotifDropdown} onToggle={() => setShowNotifDropdown(!showNotifDropdown)}>
              <Dropdown.Toggle as="div" className="position-relative" style={{ cursor: 'pointer' }}>
                <MdOutlineNotificationsNone size={25} className="header-icon" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <Badge bg="danger" pill style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    fontSize: '0.65rem'
                  }}>
                    {notifications.filter(n => !n.is_read).length}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" className="p-0 shadow" style={{ minWidth: '300px', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="p-2 bg-primary text-white fw-bold">Thông báo</div>
                <ListGroup variant="flush" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length === 0 && (
                    <ListGroup.Item className="text-center text-muted py-3">Không có thông báo</ListGroup.Item>
                  )}
                  {notifications.map((notif, idx) => (
                    <ListGroup.Item
                      key={`${notif.id}-${idx}`}
                      action
                      onClick={() => handleMarkAsRead(notif.id)}
                      style={{
                        backgroundColor: notif.is_read ? "#fff" : "#e9f5ff",
                        borderLeft: notif.is_read ? "none" : "4px solid #0d6efd",
                        cursor: 'pointer',
                        transition: "background-color 0.2s"
                      }}
                      className="py-2 px-3 d-flex flex-column"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f3f5"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = notif.is_read ? "#fff" : "#e9f5ff"}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">{notif.title}</span>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                      <div className="text-truncate" style={{ fontSize: '0.9rem' }}>{notif.content}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Profile Dropdown */}
          <Dropdown show={showProfileDropdown} onToggle={() => setShowProfileDropdown(!showProfileDropdown)}>
            <Dropdown.Toggle as="div" className="d-flex align-items-center profile-section" style={{ cursor: 'pointer' }}>
              <img src={logo} alt="Avatar" className="rounded-circle me-2" style={{ width: '35px', height: '35px' }} />
              <div className="d-flex flex-column lh-1">
                <span className="fw-bold text-dark">{user.full_name}</span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item href="/profile">Trang cá nhân</Dropdown.Item>
              <Dropdown.Item href="/settings">Cài đặt</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Đăng xuất</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
