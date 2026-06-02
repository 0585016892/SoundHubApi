import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // hoặc từ 'react-router-dom' tùy setup router của bạn
import { useNavigate as useDomNavigate } from "react-router-dom";
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
  Button,
  Space,
  ConfigProvider,
  theme,
} from "antd";
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  ShopOutlined,
  AudioOutlined,
  BlockOutlined,
  DollarOutlined,
  AppstoreOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const { id } = useParams();
  const navigate = useDomNavigate();

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
      <div className="studio-loader-container">
        <Spin size="large" />
        <Text className="studio-loader-text">
          ĐANG GIẢI MÃ CẤU TRÚC PHẦN CỨNG...
        </Text>
      </div>
    );

  if (error)
    return (
      <div className="studio-error-container">
        <Alert
          type="error"
          message={<span style={{ fontWeight: 700 }}>{error}</span>}
          showIcon
        />
        <Button
          onClick={() => navigate(-1)}
          className="btn-studio-back mt-4"
          icon={<ArrowLeftOutlined />}
        >
          QUAY LẠI HỆ THỐNG
        </Button>
      </div>
    );

  const variantColumns = [
    {
      title: "ẢNH THIẾT BỊ",
      dataIndex: "image",
      key: "image",
      width: 110,
      render: (img) => (
        <div className="variant-img-frame">
          <Image
            src={`${WEB_URL}/uploads/products/${img}`}
            width={50}
            height={50}
            fallback="https://via.placeholder.com/50"
          />
        </div>
      ),
    },
    {
      title: "TÊN PHIÊN BẢN (VARIANT)",
      dataIndex: "name_variant",
      key: "name_variant",
      render: (t) => (
        <Text style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {t?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "MÀU SẮC",
      dataIndex: "color",
      key: "color",
      render: (t) =>
        t ? (
          <Tag
            color="#1a1a1a"
            style={{ color: "#aaa", border: "1px solid #222" }}
          >
            {t}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "CÔNG SUẤT",
      dataIndex: "power",
      key: "power",
      render: (t) =>
        t ? (
          <span className="tech-spec-mono">{t}</span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "MICROPHONE",
      dataIndex: "has_microphone",
      key: "has_microphone",
      width: 140,
      render: (v) =>
        v === 1 ? (
          <span className="status-pill-micro integrated">● TÍCH HỢP</span>
        ) : (
          <span className="status-pill-micro none">○ KHÔNG KÈM</span>
        ),
    },
    {
      title: "GIÁ THƯƠNG MẠI",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (p) => (
        <span className="variant-price-txt">
          {Number(p).toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "KHO HÀNG",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      width: 120,
      render: (s) => (
        <span className={`stock-indicator ${s > 0 ? "in-stock" : "out-stock"}`}>
          {s > 0 ? `Sẵn sàng (${s})` : "Hết hàng"}
        </span>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "#111111",
          colorText: "#ffffff",
          colorPrimary: "#ff6600",
          colorBorder: "#1a1a1a",
        },
      }}
    >
      <div className="product-profile-layout">
        {/* TOP CONTROL NAVIGATION */}
        <div className="bento-navigation-panel mb-5">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Space size="middle">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(-1)}
                  className="btn-studio-back-nav"
                />
                <div>
                  <Title level={2} className="m-0 page-profile-title">
                    <AudioOutlined className="glow-icon" /> HỒ SƠ THIẾT BỊ BẢN
                    GỐC
                  </Title>
                  <Text className="page-profile-subtitle">
                    MÃ HỆ THỐNG: #{id} • CƠ SỞ DỮ LIỆU ĐỒNG BỘ
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <span
                className={`status-tag-pill ${product.status === "active" ? "active" : "inactive"}`}
              >
                ●{" "}
                {product.status === "active"
                  ? "HỆ THỐNG ONLINE"
                  : "HỆ THỐNG OFFLINE"}
              </span>
            </Col>
          </Row>
        </div>

        {/* MAIN DATA GRID */}
        <Row gutter={[20, 20]}>
          {/* CỘT TRÁI: KHUNG ĐẠI DIỆN VÀ THẺ SỐ LIỆU TÓM TẮT */}
          <Col xs={24} md={10} lg={7}>
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              {/* Media Card */}
              <Card bordered={false} className="bento-spec-card media-card">
                <div className="profile-img-viewport">
                  <Image
                    src={`${WEB_URL}/uploads/products/${product.image}`}
                    alt={product.name}
                    preview={{
                      mask: (
                        <span style={{ fontSize: 12, fontWeight: 800 }}>
                          XEM ẢNH GỐC
                        </span>
                      ),
                    }}
                  />
                </div>
              </Card>

              {/* Quick Specs Cards */}
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div className="mini-metric-box">
                    <span className="box-lbl">
                      <DollarOutlined /> GIÁ CƠ SỞ
                    </span>
                    <span className="box-val price">
                      {Number(product.price).toLocaleString()}₫
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mini-metric-box">
                    <span className="box-lbl">
                      <BlockOutlined /> BIẾN THỂ
                    </span>
                    <span className="box-val">
                      {product.variants?.length || 0} Cấu hình
                    </span>
                  </div>
                </Col>
              </Row>
            </Space>
          </Col>

          {/* CỘT PHẢI: CHI TIẾT THÔNG SỐ KỸ THUẬT & DANH MỤC */}
          <Col xs={24} md={14} lg={17}>
            <Card
              title={
                <span className="spec-card-header">
                  <InfoCircleOutlined /> THÔNG SỐ KỸ THUẬT CỐT LÕI
                </span>
              }
              bordered={false}
              className="bento-spec-card data-detail-card"
            >
              <span className="spec-product-slug">
                SLUG NODE: {product.slug}
              </span>
              <Title level={3} className="spec-product-name">
                {product.name?.toUpperCase()}
              </Title>

              <div className="spec-description-area">
                <span className="section-small-title">
                  MÔ TẢ CỦA NHÀ PHÂN PHỐI
                </span>
                <Paragraph className="paragraph-body">
                  {product.description ||
                    "Thiết bị này hiện chưa được cập nhật thông tin mô tả chi tiết từ hệ thống."}
                </Paragraph>
              </div>

              {/* Meta Taxonomy Tag */}
              <div className="taxonomy-bento-row">
                <div className="tax-item">
                  <span className="tax-lbl">
                    <ShopOutlined /> THƯƠNG HIỆU CHỦ QUẢN
                  </span>
                  <span className="tax-val">{product.brand_name || "N/A"}</span>
                </div>
                <div className="tax-item">
                  <span className="tax-lbl">
                    <DatabaseOutlined /> PHÂN CẤP DANH MỤC
                  </span>
                  <span className="tax-val">
                    {product.category_name || "N/A"}
                  </span>
                </div>
                <div className="tax-item">
                  <span className="tax-lbl">
                    <AppstoreOutlined /> TRẠNG THÁI KHO
                  </span>
                  <span
                    className="tax-val"
                    style={{
                      color: product.variants?.length > 0 ? "#22c55e" : "#666",
                    }}
                  >
                    {product.variants?.length > 0
                      ? "SẴN PHÂN LOẠI"
                      : "CHƯA CẤU HÌNH"}
                  </span>
                </div>
              </div>
            </Card>
          </Col>

          {/* DƯỚI FULL RỘNG: MA TRẬN BIẾN THỂ PHẦN CỨNG */}
          <Col span={24} className="mt-4">
            <Card
              title={
                <span className="spec-card-header">
                  <ThunderboltOutlined /> MA TRẬN PHIÊN BẢN THƯƠNG MẠI
                  (VARIANTS)
                </span>
              }
              bordered={false}
              className="bento-spec-card table-variant-card"
            >
              {product.variants && product.variants.length > 0 ? (
                <Table
                  columns={variantColumns}
                  dataSource={product.variants}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 900 }}
                  className="studio-profile-table"
                />
              ) : (
                <div className="empty-variant-placeholder">
                  <FireOutlined className="empty-icon" />
                  <Text className="empty-txt">
                    Không phát hiện cấu hình biến thể thương mại cho thiết bị
                    này.
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <style>{`
          .product-profile-layout { padding: 30px; background: #080808; min-height: 100vh; font-family: 'Inter', sans-serif; color: #fff; }
          .mb-5 { margin-bottom: 24px; }
          .mt-4 { margin-top: 16px; }
          .m-0 { margin: 0 !important; }

          /* Loader & Error Screen */
          .studio-loader-container, .studio-error-container { text-align: center; padding: 120px 40px; background: #080808; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
          .studio-loader-text { color: #444; font-size: 10px; font-weight: 800; letter-spacing: 2px; }
          .btn-studio-back { background: #111 !important; border: 1px solid #222 !important; color: #fff !important; font-weight: 700; border-radius: 6px; }

          /* Top Nav Control Panel */
          .bento-navigation-panel { background: #111; border: 1px solid #1a1a1a; border-radius: 16px; padding: 20px 24px; }
          .btn-studio-back-nav { background: #161616 !important; border: 1px solid #222 !important; color: #fff !important; width: 40px; height: 40px; border-radius: 8px !important; }
          .btn-studio-back-nav:hover { border-color: #ff6600 !important; color: #ff6600 !important; }
          .page-profile-title { font-weight: 900 !important; letter-spacing: -1.2px; color: #fff !important; font-size: 20px !important; }
          .glow-icon { color: #ff6600; filter: drop-shadow(0 0 8px rgba(255,102,0,0.4)); }
          .page-profile-subtitle { font-size: 10px; letter-spacing: 1px; color: #d5d5d5; font-weight: 800; display: block; margin-top: 2px; }

          /* Status Pill */
          .status-tag-pill { font-size: 10px; font-weight: 800; padding: 6px 14px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.5px; }
          .status-tag-pill.active { color: #22c55e; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.15); }
          .status-tag-pill.inactive { color: #555; background: rgba(255, 255, 255, 0.02); border: 1px solid #1a1a1a; }

          /* Bento Cards Framework */
          .bento-spec-card { background: #111 !important; border: 1px solid #1a1a1a !important; border-radius: 20px !important; overflow: hidden; }
          .spec-card-header { color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
          
          /* Left Column Frame UI */
          .profile-img-viewport { background: #141414; padding: 12px; border-radius: 14px; border: 1px solid #1c1c1c; display: flex; align-items: center; justify-content: center; }
          .profile-img-viewport img { border-radius: 10px; object-fit: cover; width: 100%; height: auto; }
          
          .mini-metric-box { background: #111; border: 1px solid #1a1a1a; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 4px; }
          .mini-metric-box .box-lbl { color: #d7d7d7; font-size: 9px; font-weight: 800; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px; }
          .mini-metric-box .box-val { color: #fff; font-size: 16px; font-weight: 900; letter-spacing: -0.5px; }
          .mini-metric-box .box-val.price { color: #ff6600; font-family: 'Space Mono', monospace; }

          /* Right Column Specs Area */
          .data-detail-card { padding: 10px 14px; }
          .spec-product-slug { color: #ff6600; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; display: block; margin-bottom: 4px; }
          .spec-product-name { font-weight: 900 !important; color: #fff !important; letter-spacing: -1px; font-size: 24px !important; margin-bottom: 20px !important; }
          
          .spec-description-area { background: #151515; border: 1px solid #1d1d1d; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
          .section-small-title { display: block; font-size: 9px; font-weight: 800; color: #d5d5d5; letter-spacing: 1px; margin-bottom: 8px; }
          .paragraph-body { color: #999 !important; font-size: 14px !important; lineHeight: 1.7 !important; margin: 0 !important; }

          /* Taxonomy Matrix Layout */
          .taxonomy-bento-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #141414; padding: 14px; border-radius: 12px; border: 1px solid #1c1c1c; }
          .tax-item { display: flex; flex-direction: column; gap: 2px; }
          .tax-lbl { font-size: 9px; font-weight: 800; color: #d1d1d1; display: flex; align-items: center; gap: 6px; }
          .tax-val { font-size: 13px; color: #fff; font-weight: 700; }

          /* Variant Specification Grid Table */
          .table-variant-card .ant-card-head { border-bottom: 1px solid #1a1a1a !important; padding: 0 24px !important; height: 50px !important; display: flex; align-items: center; }
          .studio-profile-table .ant-table { background: transparent !important; }
          .studio-profile-table .ant-table-thead > tr > th { background: #161616 !important; color: #e6e6e6 !important; font-size: 10px !important; font-weight: 800 !important; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid #1a1a1a !important; padding: 14px 20px !important; }
          .studio-profile-table .ant-table-tbody > tr > td { border-bottom: 1px solid #151515 !important; padding: 12px 20px !important; }
          .studio-profile-table .ant-table-tbody > tr:hover > td { background: #141414 !important; }
          
          .variant-img-frame { background: #171717; border: 1px solid #222; padding: 4px; border-radius: 8px; display: inline-flex; overflow: hidden; }
          .tech-spec-mono { font-family: 'Space Mono', monospace; font-weight: 700; color: #ff6600; }
          .variant-price-txt { font-family: 'Space Mono', monospace; font-weight: 900; color: #fff; font-size: 15px; }

          .status-pill-micro { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 5px; }
          .status-pill-micro.integrated { color: #3b82f6; background: rgba(59, 130, 246, 0.08); }
          .status-pill-micro.none { color: #555; background: rgba(255,255,255,0.02); }

          .stock-indicator { font-size: 11px; font-weight: 700; }
          .stock-indicator.in-stock { color: #22c55e; }
          .stock-indicator.out-stock { color: #ef4444; }

          /* Empty State Placement */
          .empty-variant-placeholder { padding: 50px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .empty-icon { font-size: 24px; color: #222; }
          .empty-txt { color: #444; font-size: 13px; font-weight: 600; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ProductDetail;
