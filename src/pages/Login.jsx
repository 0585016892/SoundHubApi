import React, { useState, useContext } from "react";
import { Form, Input, Button, Card, Row, Col, Spin, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo2.png";
import socket from "../utils/socket";

const Login = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, values);

      // Lưu user + token
      login(res.data.user);
      localStorage.setItem("token", res.data.token);

      // socket connect
      socket.connect();
      socket.emit("join", {
        userId: res.data.user.id,
        isAdmin: res.data.user.role === "admin",
      });

      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Row style={{ width: "100%", maxWidth: 900 }}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Row>
              {/* Left image */}
              <Col
                span={12}
                style={{
                  background: "#f0f3ff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img src={Logo} alt="Login" style={{ width: "100%" }} />
              </Col>

              {/* Right form */}
              <Col span={12} style={{ padding: "40px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <img
                    src="https://via.placeholder.com/120x40?text=Logo"
                    alt="logo"
                  />
                </div>

                <h3 style={{ textAlign: "center", marginBottom: 30 }}>
                  TRANG QUẢN TRỊ
                </h3>

                <Form layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="johndoe@gmail.com"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Nhập mật khẩu!" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="********"
                      size="large"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{ background: "#6C63FF", borderRadius: 8 }}
                    disabled={loading}
                  >
                    {loading ? <Spin /> : "LOGIN"}
                  </Button>
                </Form>

                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <a href="/forgot-password" style={{ color: "#6C63FF" }}>
                    Forget your password?
                  </a>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
