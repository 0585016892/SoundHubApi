import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Spin,
  Alert,
  Typography,
  Image,
} from "antd";

const { Title, Text } = Typography;

const ProductDetail = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const { id } = useParams();

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
  }, [id]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  if (error)
    return <Alert type="error" message={error} style={{ margin: 20 }} />;

  if (!product) return <p style={{ margin: 20 }}>Không có dữ liệu sản phẩm</p>;

  // ✅ Columns cho bảng variants
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (img) => (
        <Image
          src={`${WEB_URL}/uploads/products/${img}`}
          width={70}
          style={{ borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên biến thể",
      dataIndex: "name_variant",
      key: "name_variant",
      render: (t) => <b>{t}</b>,
    },
    { title: "Màu", dataIndex: "color", key: "color" },
    { title: "Công suất", dataIndex: "power", key: "power" },
    { title: "Kết nối", dataIndex: "connection_type", key: "connection_type" },
    {
      title: "Micro",
      dataIndex: "has_microphone",
      key: "has_microphone",
      render: (v) =>
        v === 1 ? <Tag color="green">✔ Có</Tag> : <Tag>✖ Không</Tag>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (p) => (
        <span style={{ color: "red", fontWeight: "bold" }}>
          {Number(p).toLocaleString()}₫
        </span>
      ),
    },
    { title: "Tồn kho", dataIndex: "stock", key: "stock" },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* TITLE */}
      <Title level={3} style={{ color: "#1677ff" }}>
        📦 Chi tiết sản phẩm
      </Title>

      <Row gutter={24}>
        {/* IMAGE */}
        <Col span={8}>
          <Card title="Ảnh sản phẩm" bordered={false}>
            <div style={{ textAlign: "center" }}>
              <Image
                src={`${WEB_URL}/uploads/products/${product.image}`}
                alt={product.name}
                width={250}
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          </Card>
        </Col>

        {/* INFO */}
        <Col span={16}>
          <Card title="Thông tin sản phẩm" bordered={false}>
            <Title level={4}>{product.name}</Title>
            <Text type="secondary">{product.slug}</Text>

            <p style={{ marginTop: 12 }}>
              <b>Giá bán:</b>{" "}
              <span style={{ color: "red", fontSize: 22, fontWeight: "bold" }}>
                {Number(product.price).toLocaleString()}₫
              </span>
            </p>

            <p>
              <b>Trạng thái:</b>{" "}
              {product.status === "active" ? (
                <Tag color="green">Còn hàng</Tag>
              ) : (
                <Tag color="default">Hết hàng</Tag>
              )}
            </p>

            <p>
              <b>Mô tả:</b>
              <br />
              {product.description}
            </p>
          </Card>
        </Col>
      </Row>

      {/* VARIANTS */}
      <Card
        title="Danh sách biến thể (Variants)"
        style={{ marginTop: 24 }}
        bordered={false}
      >
        {product.variants && product.variants.length > 0 ? (
          <Table
            columns={columns}
            dataSource={product.variants}
            rowKey="id"
            pagination={false}
            scroll={{ y: 350 }}
          />
        ) : (
          <Text type="secondary">Sản phẩm không có biến thể nào</Text>
        )}
      </Card>
    </div>
  );
};

export default ProductDetail;
