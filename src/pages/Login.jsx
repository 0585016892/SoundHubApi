import React, { useState, useContext } from "react";
import { Form, Button, Container, Row, Col, Card, InputGroup, Spinner } from "react-bootstrap";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/img/logo2.png';
import socket from "../utils/socket";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
    
    // Lưu user và token
    login(res.data.user);
    localStorage.setItem("token", res.data.token);

    // Kết nối socket và thông báo online
    socket.connect();
    socket.emit("join", { userId: res.data.user.id, isAdmin: res.data.user.role === "admin" });

    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Đăng nhập thất bại");
  } finally {
    setLoading(false);
  }
};

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg d-flex flex-row" style={{ borderRadius: "16px", overflow: "hidden" }}>
            {/* Left illustration */}
            <div style={{ flex: 1, background: "#f0f3ff", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                src={Logo} // placeholder, thay bằng ảnh SVG/PNG của bạn
                alt="Login Illustration"
                style={{ width: "100%", maxWidth: "100%" }}
              />
            </div>

            {/* Right form */}
            <div style={{ flex: 1, padding: "2rem" }}>
              <div className="text-center mb-4">
                <img src="https://via.placeholder.com/120x40?text=Logo" alt="Company Logo" />
              </div>
              <h5 className="mb-4 text-center">TRANG QUẢN TRỊ</h5>

              {error && <div className="alert alert-danger">{error}</div>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text style={{ background: "#fff", borderRight: "none" }}><FaEnvelope /></InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="johndoe@xyz.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ borderRadius: "0 8px 8px 0", borderLeft: "none", height: "45px" }}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text style={{ background: "#fff", borderRight: "none" }}><FaLock /></InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ borderRadius: "0 8px 8px 0", borderLeft: "none", height: "45px" }}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-2 mb-2"
                  style={{ background: "#6C63FF", border: "none", borderRadius: "8px" }}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "LOGIN"}
                </Button>
              </Form>

              <div className="text-center mt-2">
                <a href="/forgot-password" style={{ fontSize: "0.85rem", color: "#6C63FF" }}>Forget your password?</a>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
