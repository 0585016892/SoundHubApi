// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Card, Form, Input, Button, Tabs, Avatar, Row, Col, Spin } from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { updateProfile, changePassword } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo2.png";

const { TabPane } = Tabs;

const ProfilePage = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;
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
      setLoading(true);
      await updateProfile(user.id, profile);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    toast.success("Tính năng chưa phát triển!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return <Spin />;

  return (
    <div style={{ padding: 40 }}>
      <Row gutter={24} justify="center">
        {/* Avatar + logout */}
        <Col span={8}>
          <Card style={{ textAlign: "center" }}>
            <Avatar
              size={120}
              src={profile.avatar ? `${WEB_URL}/uploads/products/${profile.avatar}` : logo}
            />
            <h3 style={{ marginTop: 12 }}>{profile.full_name || "Người dùng"}</h3>
            <p style={{ color: "#888" }}>{profile.email}</p>

            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Card>
        </Col>

        {/* Tabs */}
        <Col span={16}>
          <Card>
            <Tabs defaultActiveKey="profile">
              {/* Thông tin cá nhân */}
              <TabPane
                tab={
                  <span>
                    <UserOutlined /> Thông tin
                  </span>
                }
                key="profile"
              >
                <Form layout="vertical">
                  <Form.Item label="Họ và tên">
                    <Input
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </Form.Item>

                  <Form.Item label="Email">
                    <Input value={profile.email} disabled />
                  </Form.Item>

                  <Form.Item label="Số điện thoại">
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </Form.Item>

                  <Button type="primary" loading={loading} onClick={handleProfileUpdate}>
                    Cập nhật
                  </Button>
                </Form>
              </TabPane>

              {/* Đổi mật khẩu */}
              <TabPane
                tab={
                  <span>
                    <LockOutlined /> Đổi mật khẩu
                  </span>
                }
                key="password"
              >
                <Form layout="vertical">
                  <Form.Item label="Mật khẩu hiện tại">
                    <Input.Password
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Mật khẩu mới">
                    <Input.Password
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Xác nhận mật khẩu mới">
                    <Input.Password
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                  </Form.Item>

                  <Button type="primary" onClick={handleChangePassword}>
                    Đổi mật khẩu
                  </Button>
                </Form>
              </TabPane>

              {/* Cài đặt */}
              <TabPane
                tab={
                  <span>
                    <SettingOutlined /> Cài đặt
                  </span>
                }
                key="preferences"
              >
                <p>Chưa có cài đặt nào.</p>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
