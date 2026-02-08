import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Row, Col, Table, Tag, Spin, Alert, Typography, Image, Button, Space, ConfigProvider, Divider
} from "antd";
import { 
  ArrowLeftOutlined, ThunderboltOutlined, InfoCircleOutlined, 
  DatabaseOutlined, ShopOutlined, AudioOutlined 
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/productdetail/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Lỗi khi lấy dữ liệu");
        } else {
          setProduct(data);
        }
      } catch (err) {
        setError("Không thể kết nối server!");
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, API_URL]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px", background: "#0a0a0a", minHeight: "100vh" }}>
        <Spin size="large" />
        <p style={{ color: "#fff", marginTop: 20 }}>Đang giải mã dữ liệu âm thanh...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, background: "#0a0a0a", minHeight: "100vh" }}>
        <Alert type="error" message={error} showIcon />
        <Button onClick={() => navigate(-1)} style={{ marginTop: 20 }} icon={<ArrowLeftOutlined />}>Quay lại</Button>
      </div>
    );

  const variantColumns = [
    {
      title: <Text style={{ color: "#888" }}>ẢNH</Text>,
      dataIndex: "image",
      key: "image",
      render: (img) => (
        <Image
          src={`${WEB_URL}/uploads/products/${img}`}
          width={60}
          style={{ borderRadius: 6, border: "1px solid #333" }}
        />
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>PHIÊN BẢN</Text>,
      dataIndex: "name_variant",
      key: "name_variant",
      render: (t) => <Text style={{ color: "#fff", fontWeight: "600" }}>{t}</Text>,
    },
    { title: <Text style={{ color: "#888" }}>MÀU</Text>, dataIndex: "color", key: "color", render: (t) => <Text style={{ color: "#fff" }}>{t}</Text> },
    { title: <Text style={{ color: "#888" }}>CÔNG SUẤT</Text>, dataIndex: "power", key: "power", render: (t) => <Text style={{ color: "#fff" }}>{t}</Text> },
    {
      title: <Text style={{ color: "#888" }}>MICRO</Text>,
      dataIndex: "has_microphone",
      key: "has_microphone",
      render: (v) => v === 1 ? <Tag color="blue">CÓ</Tag> : <Tag color="#333">KHÔNG</Tag>,
    },
    {
      title: <Text style={{ color: "#888" }}>GIÁ BIẾN THỂ</Text>,
      dataIndex: "price",
      key: "price",
      render: (p) => <Text style={{ color: "#ff6600", fontWeight: "bold" }}>{Number(p).toLocaleString()}₫</Text>,
    },
    { 
      title: <Text style={{ color: "#888" }}>KHO</Text>, 
      dataIndex: "stock", 
      key: "stock",
      render: (s) => <Tag color={s > 0 ? "green" : "red"}>{s}</Tag>
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: "#141414", colorText: "#ffffff", colorPrimary: "#ff6600" },
        components: {
          Table: { headerBg: "#1a1a1a", rowHoverBg: "#1f1f1f", colorText: "#fff" },
          Card: { colorBorderSecondary: "#222" }
        }
      }}
    >
      <div style={{ padding: "24px", background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER NAVIGATION */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space size="middle">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)} 
                ghost 
                style={{ color: "#fff", borderColor: "#333" }}
              />
              <div>
                <Title level={2} style={{ color: "#fff", margin: 0 }}>
                  <AudioOutlined style={{ color: "#ff6600", marginRight: 10 }} /> 
                  Hồ sơ thiết bị
                </Title>
                <Text style={{ color: "#666" }}>ID Sản phẩm: {id} • Quản lý thông tin chi tiết</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Tag color={product.status === "active" ? "#52c41a" : "#444"} style={{ padding: "5px 15px", fontSize: "14px" }}>
              {product.status === "active" ? "ĐANG KINH DOANH" : "NGỪNG KINH DOANH"}
            </Tag>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* CỘT TRÁI: ẢNH & TRẠNG THÁI NHANH */}
          <Col xs={24} lg={8}>
            <Card style={{ background: "#141414", textAlign: "center", border: "1px solid #222" }}>
              <Image
                src={`${WEB_URL}/uploads/products/${product.image}`}
                alt={product.name}
                style={{ borderRadius: 12, border: "1px solid #333", width: "100%", maxWidth: "350px" }}
              />
              <Divider style={{ borderColor: "#222" }} />
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ background: "#0d0d0d", padding: "15px", borderRadius: 8 }}>
                    <Text style={{ color: "#666", display: "block" }}>Giá cơ bản</Text>
                    <Title level={4} style={{ color: "#ff6600", margin: 0 }}>{Number(product.price).toLocaleString()}₫</Title>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: "#0d0d0d", padding: "15px", borderRadius: 8 }}>
                    <Text style={{ color: "#666", display: "block" }}>Biến thể</Text>
                    <Title level={4} style={{ color: "#fff", margin: 0 }}>{product.variants?.length || 0}</Title>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <Col xs={24} lg={16}>
            <Card 
              title={<Space><InfoCircleOutlined style={{ color: "#ff6600" }} /><span style={{ color: "#fff" }}>Thông tin kỹ thuật & Mô tả</span></Space>}
              style={{ background: "#141414", border: "1px solid #222", height: "100%" }}
            >
              <Title level={3} style={{ color: "#fff", marginBottom: 5 }}>{product.name}</Title>
              <Text style={{ color: "#ff6600", fontSize: "16px" }}>Slug: {product.slug}</Text>
              
              <Divider style={{ borderColor: "#222" }} />
              
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ color: "#888", display: "block", marginBottom: 8 }}>MÔ TẢ SẢN PHẨM</Text>
                <Paragraph style={{ color: "#e0e0e0", fontSize: "15px", lineHeight: "1.8" }}>
                  {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                </Paragraph>
              </div>

              <Row gutter={16} style={{ marginTop: 30 }}>
                <Col span={8}>
                  <Space direction="vertical">
                    <Text style={{ color: "#666" }}><ShopOutlined /> Thương hiệu</Text>
                    <Text style={{ color: "#fff" }}>{product.brand_name || "N/A"}</Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical">
                    <Text style={{ color: "#666" }}><DatabaseOutlined /> Danh mục</Text>
                    <Text style={{ color: "#fff" }}>{product.category_name || "N/A"}</Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* BẢNG BIẾN THỂ (FULL WIDTH) */}
          <Col span={24}>
            <Card 
              title={<Space><ThunderboltOutlined style={{ color: "#ff6600" }} /><span style={{ color: "#fff" }}>Danh sách các phiên bản cấu hình (Variants)</span></Space>}
              style={{ background: "#141414", border: "1px solid #222" }}
            >
              {product.variants && product.variants.length > 0 ? (
                <Table
                  columns={variantColumns}
                  dataSource={product.variants}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 800 }}
                  style={{ background: "#141414" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Text style={{ color: "#444" }}>Thiết bị này không có cấu hình biến thể.</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* CSS GLOBAL ĐỂ FIX CHỮ TRẮNG */}
        <style>{`
          .ant-table-thead > tr > th { border-bottom: 1px solid #333 !important; }
          .ant-table-cell { border-bottom: 1px solid #1f1f1f !important; }
          .ant-card-head { border-bottom: 1px solid #222 !important; }
          .ant-divider-horizontal { margin: 16px 0; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ProductDetail;