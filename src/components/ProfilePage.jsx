// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Container, Row, Col, Card, Form, Button, Tab, Nav, Image, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { updateProfile, changePassword } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaSignOutAlt } from "react-icons/fa";
import logo from '../assets/img/logo2.png'
import axios from "axios";
const ProfilePage = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL; ;
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(user.id,profile);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };
const handleChangePassword = async () => {
    toast.success("Tính năng chưa phát triển!");

  // const { currentPassword, newPassword, confirmPassword } = passwordData;

  // // 1. Validate frontend
  // if (!currentPassword || !newPassword || !confirmPassword) {
  //   toast.error("Vui lòng nhập đầy đủ thông tin");
  //   return;
  // }
  // if (newPassword !== confirmPassword) {
  //   toast.error("Mật khẩu mới và xác nhận không khớp");
  //   return;
  // }
  // if (currentPassword === newPassword) {
  //   toast.error("Mật khẩu mới phải khác mật khẩu cũ");
  //   return;
  // }

  // try {
  //   const res = await changePassword({ currentPassword, newPassword });
  //   console.log(res);
    
  //   toast.success(res.message);
  //   setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  // } catch (err) {
  //   toast.error(err.message);
  // }
};


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        {/* Avatar + logout */}
        <Col md={4}>
          <Card className="text-center shadow-sm mb-4">
            <Card.Body>
              <Image
                src={profile.avatar ? `${WEB_URL}/uploads/products/${profile.avatar}` : logo}
                roundedCircle
                width={120}
                height={120}
                className="mb-3"
              />
              <h5 className="mb-1">{profile.full_name || "Người dùng"}</h5>
              <p className="text-muted">{profile.email}</p>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                <FaSignOutAlt className="me-1" /> Đăng xuất
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Tabs thông tin */}
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="profile">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="profile"><FaUser className="me-1" />Thông tin</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password"><FaLock className="me-1" />Đổi mật khẩu</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="preferences">Cài đặt</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="mt-3">
                  {/* Thông tin cá nhân */}
                  <Tab.Pane eventKey="profile">
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={profile.email} disabled />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </Form.Group>
                      <Button onClick={handleProfileUpdate}>Cập nhật</Button>
                    </Form>
                  </Tab.Pane>

                  {/* Đổi mật khẩu */}
                  <Tab.Pane eventKey="password">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu hiện tại</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu mới</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                      />
                    </Form.Group>
                    <Button onClick={handleChangePassword}>Đổi mật khẩu</Button>
                  </Form>
                </Tab.Pane>

                  {/* Cài đặt */}
                  <Tab.Pane eventKey="preferences">
                    <p>Chưa có cài đặt nào.</p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
