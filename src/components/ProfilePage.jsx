import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Card, Form, Input, Button, Tabs, Avatar, Row, Col, Spin, Typography, Space, Divider, ConfigProvider, theme } from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined, SettingOutlined, CameraOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { updateProfile } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo2.png";

const { Title, Text } = Typography;

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

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile(user.id, profile);
      toast.success("Hồ sơ đã được tinh chỉnh thành công!");
    } catch (err) {
      toast.error("Cập nhật thất bại, vui lòng kiểm tra lại");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505' }}>
      <Spin size="large" tip="Đang tải hồ sơ nghệ sĩ..." />
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: "#ff6600", colorBgContainer: "#111", borderRadius: 12 }
      }}
    >
      <div style={{ background: "#050505", minHeight: "100vh", padding: "40px 20px" }}>
        <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {/* LEFT COLUMN: AVATAR & QUICK INFO */}
          <Col xs={24} md={8}>
            <Card 
              bordered={false} 
              style={{ 
                textAlign: "center", 
                background: "linear-gradient(145deg, #141414, #0a0a0a)",
                border: "1px solid #222",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={150}
                  src={profile.avatar ? `${WEB_URL}/uploads/products/${profile.avatar}` : logo}
                  style={{ 
                    border: "4px solid #ff6600", 
                    padding: 4, 
                    boxShadow: "0 0 20px rgba(255,102,0,0.2)" 
                  }}
                />
                <Button 
                  shape="circle" 
                  icon={<CameraOutlined />} 
                  style={{ position: 'absolute', bottom: 10, right: 10, background: '#ff6600', border: 'none' }}
                />
              </div>

              <Title level={3} style={{ marginTop: 20, marginBottom: 0 }}>{profile.full_name || "Admin TCD"}</Title>
              <Text type="secondary"><MailOutlined /> {profile.email}</Text>
              
              <Divider style={{ borderColor: '#222' }} />
              
              <div style={{ textAlign: 'left', marginBottom: 20 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Vai trò:</Text>
                    <Text strong style={{ color: '#ff6600' }}>Hệ thống Quản trị</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Trạng thái:</Text>
                    <Text style={{ color: '#6BCB77' }}>● Trực tuyến</Text>
                  </div>
                </Space>
              </div>

              <Button 
                block 
                danger 
                ghost
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                style={{ borderRadius: 8, height: 40 }}
              >
                Đăng xuất khỏi hệ thống
              </Button>
            </Card>
          </Col>

          {/* RIGHT COLUMN: DETAILED SETTINGS */}
          <Col xs={24} md={16}>
            <Card 
              bordered={false} 
              style={{ 
                background: "#111", 
                border: "1px solid #222",
                minHeight: 500
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Tabs
                defaultActiveKey="profile"
                tabPosition="top"
                type="line"
                style={{ padding: '0 20px 20px 20px' }}
                items={[
                  {
                    key: "profile",
                    label: <span style={{ padding: '0 10px' }}><UserOutlined /> THÔNG TIN</span>,
                    children: (
                      <div style={{ padding: '20px 0' }}>
                        <Title level={4} style={{ color: '#fff', marginBottom: 25 }}>Cài đặt hồ sơ cá nhân</Title>
                        <Form layout="vertical" requiredMark={false}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item label={<Text type="secondary">Họ và tên</Text>}>
                                <Input
                                  size="large"
                                  prefix={<UserOutlined style={{ color: '#555' }} />}
                                  value={profile.full_name}
                                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                  style={{ background: '#0a0a0a', borderColor: '#333' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label={<Text type="secondary">Số điện thoại</Text>}>
                                <Input
                                  size="large"
                                  prefix={<PhoneOutlined style={{ color: '#555' }} />}
                                  value={profile.phone}
                                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                  style={{ background: '#0a0a0a', borderColor: '#333' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item label={<Text type="secondary">Địa chỉ Email (Cố định)</Text>}>
                            <Input
                              size="large"
                              prefix={<MailOutlined style={{ color: '#555' }} />}
                              value={profile.email}
                              disabled
                              style={{ background: '#181818', borderColor: '#222' }}
                            />
                          </Form.Item>

                          <Divider style={{ borderColor: '#222' }} />
                          
                          <Button 
                            type="primary" 
                            size="large"
                            loading={loading} 
                            onClick={handleProfileUpdate}
                            style={{ 
                              background: '#ff6600', 
                              boxShadow: '0 4px 15px rgba(255,102,0,0.3)',
                              padding: '0 40px',
                              height: 45
                            }}
                          >
                            Lưu thay đổi
                          </Button>
                        </Form>
                      </div>
                    )
                  },
                  {
                    key: "password",
                    label: <span style={{ padding: '0 10px' }}><LockOutlined /> BẢO MẬT</span>,
                    children: (
                      <div style={{ padding: '20px 0' }}>
                        <Title level={4} style={{ color: '#fff', marginBottom: 25 }}>Đổi mật khẩu truy cập</Title>
                        <Form layout="vertical">
                          <Form.Item label={<Text type="secondary">Mật khẩu hiện tại</Text>}>
                            <Input.Password size="large" style={{ background: '#0a0a0a', borderColor: '#333' }} />
                          </Form.Item>
                          <Form.Item label={<Text type="secondary">Mật khẩu mới</Text>}>
                            <Input.Password size="large" style={{ background: '#0a0a0a', borderColor: '#333' }} />
                          </Form.Item>
                          <Form.Item label={<Text type="secondary">Xác nhận mật khẩu</Text>}>
                            <Input.Password size="large" style={{ background: '#0a0a0a', borderColor: '#333' }} />
                          </Form.Item>
                          <Button type="primary" style={{ background: '#ff6600', height: 45, padding: '0 40px' }}>
                            Cập nhật mật khẩu
                          </Button>
                        </Form>
                      </div>
                    )
                  },
                  {
                    key: "preferences",
                    label: <span style={{ padding: '0 10px' }}><SettingOutlined /> HỆ THỐNG</span>,
                    children: (
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <SettingOutlined style={{ fontSize: 40, color: '#333', marginBottom: 20 }} />
                        <p style={{ color: '#555' }}>Các tùy chỉnh nâng cao dành cho Admin sẽ được cập nhật trong phiên bản tiếp theo.</p>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>

        <style>{`
          .ant-tabs-nav::before { border-bottom: 1px solid #222 !important; }
          .ant-tabs-tab-active .ant-tabs-tab-btn { color: #ff6600 !important; }
          .ant-tabs-ink-bar { background: #ff6600 !important; }
          .ant-form-item-label label { font-size: 13px; font-weight: 500; }
          input:focus, .ant-input-affix-wrapper-focused { border-color: #ff6600 !important; box-shadow: 0 0 5px rgba(255,102,0,0.2) !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ProfilePage;