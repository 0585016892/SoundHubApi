import React, { useState, useContext } from "react";
import { Form, Input, Button, Card, Row, Col, Spin, message, Typography } from "antd";
import { MailOutlined, LockOutlined, SoundOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

const { Title, Text } = Typography;

const Login = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, values);
      login(res.data.user);
      localStorage.setItem("token", res.data.token);
      socket.connect();
      socket.emit("join", {
        userId: res.data.user.id,
        isAdmin: res.data.user.role === "admin",
      });
      message.success("Hệ thống âm thanh đã sẵn sàng!");
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.message || "Thông tin đăng nhập không khớp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a", // Nền đen sâu
        backgroundImage: "radial-gradient(circle at 20% 30%, #1a1a1a 0%, #050505 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: 1000,
          borderRadius: 24,
          background: "rgba(255, 255, 255, 0.03)", // Hiệu ứng kính (Glassmorphism)
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row>
          {/* Cột trái: Vibe Âm nhạc & Loa */}
          <Col xs={0} sm={0} md={12} style={{ 
            position: "relative",
            background: "url('https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=2070&auto=format&fit=crop') center/cover", // Ảnh loa cao cấp
            minHeight: "600px",
            display: "flex",
            alignItems: "flex-end",
            padding: "40px"
          }}>
            {/* Overlay màu cam đen */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(255,102,0,0.2) 100%)"
            }} />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <SoundOutlined style={{ fontSize: "40px", color: "#ff6600", marginBottom: "16px" }} />
              <Title level={1} style={{ color: "#fff", margin: 0, fontSize: "36px", letterSpacing: "-1px" }}>
                AUDIO <span style={{ color: "#ff6600" }}>PRO</span>
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>
                The ultimate sound management experience.
              </Text>
            </div>
          </Col>

          {/* Cột phải: Form nhập liệu */}
          <Col xs={24} sm={24} md={12} style={{ padding: "60px 50px", background: "transparent" }}>
            <div style={{ marginBottom: "40px" }}>
              <Title level={2} style={{ color: "#fff", marginBottom: "8px" }}>Hệ thống quản trị</Title>
              <Text style={{ color: "#666" }}>Vui lòng xác thực quyền truy cập</Text>
            </div>

            <Form layout="vertical" onFinish={onFinish} size="large">
              <Form.Item
                name="email"
                rules={[{ required: true, type: "email", message: "Nhập email quản trị!" }]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#ff6600" }} />}
                  placeholder="Email"
                  style={{ 
                    background: "rgba(255,255,255,0.05)", 
                    border: "1px solid #333", 
                    color: "#fff",
                    borderRadius: "12px"
                  }}
                  className="dark-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Nhập mật khẩu mật mã!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#ff6600" }} />}
                  placeholder="Mật khẩu"
                  style={{ 
                    background: "rgba(255,255,255,0.05)", 
                    border: "1px solid #333", 
                    color: "#fff",
                    borderRadius: "12px"
                  }}
                />
              </Form.Item>

              <div style={{ textAlign: "right", marginBottom: "24px" }}>
                <Button type="link" style={{ color: "#ff6600", padding: 0 }}>
                  Quên mật mã?
                </Button>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  icon={<ArrowRightOutlined />}
                  style={{
                    height: "55px",
                    background: "#ff6600",
                    borderColor: "#ff6600",
                    borderRadius: "12px",
                    fontSize: "18px",
                    fontWeight: "600",
                    boxShadow: "0 10px 20px rgba(255, 102, 0, 0.2)"
                  }}
                >
                  KẾT NỐI
                </Button>
              </Form.Item>
            </Form>

            <div style={{ marginTop: "40px", borderTop: "1px solid #222", paddingTop: "20px", textAlign: "center" }}>
              <Text style={{ color: "#444" }}>Design by Audiophile Admin v2.0</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* CSS bổ sung để xử lý placeholder màu tối */}
      <style>{`
        .ant-input::placeholder { color: #555 !important; }
        .ant-input-password input { color: #fff !important; }
        .ant-input-affix-wrapper:hover { border-color: #ff6600 !important; }
        .ant-input-affix-wrapper-focused { border-color: #ff6600 !important; box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default Login;