import React, { useEffect, useState } from "react";
import {
  Modal,
  Spin,
  Tag,
  Row,
  Col,
  Table,
  Typography,
  ConfigProvider,
  theme,
  Space,
  Button,
} from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  MessageOutlined,
  PrinterOutlined,
  IdcardOutlined,
  WalletOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { getOrderById } from "../api/orderApi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const { Text, Title } = Typography;

const statusMap = {
  pending: {
    label: "CHỜ XỬ LÝ",
    color: "#FF5302",
    bg: "rgba(255, 83, 2, 0.1)",
  },
  shipping: {
    label: "ĐANG GIAO",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
  },
  completed: {
    label: "HOÀN TẤT",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
  },
  cancelled: {
    label: "ĐÃ HỦY",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
};

const OrderDetailModal = ({ show, handleClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId || !show) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(orderId);
        setOrder({ ...res, items: Array.isArray(res.items) ? res.items : [] });
      } catch {
        toast.error("Lỗi trích xuất dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, show]);

  const columns = [
    {
      title: "SẢN PHẨM",
      dataIndex: "product_name",
      render: (t, r) => (
        <div className="product-cell">
          <div className="product-glow-dot" />
          <div>
            <div className="p-name">{t}</div>
            <div className="p-variant">{r.color || "Standard Edition"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "SỐ LƯỢNG",
      dataIndex: "quantity",
      align: "center",
      render: (q) => <span className="q-val">×{q}</span>,
    },
    {
      title: "ĐƠN GIÁ",
      dataIndex: "price",
      align: "right",
      render: (v) => (
        <span className="p-val">{Number(v).toLocaleString()}đ</span>
      ),
    },
    {
      title: "TỔNG",
      dataIndex: "total",
      align: "right",
      render: (v) => (
        <span className="t-val">{Number(v).toLocaleString()}đ</span>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Modal
        open={show}
        onCancel={handleClose}
        footer={null}
        width={1300} // Mở rộng tối đa chiều ngang
        centered
        className="wide-neo-modal"
        title={null}
        closeIcon={<span className="close-x">×</span>}
      >
        {loading ? (
          <div className="loader-box">
            <Spin size="large" />
            <div className="loader-text">FETCHING DATA...</div>
          </div>
        ) : order ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal-inner"
          >
            <Row gutter={0}>
              {/* CỘT TRÁI: THÔNG TIN TỔNG QUAN (STAY STICKY) */}
              <Col xs={24} lg={8} className="sidebar-info">
                <div className="sticky-content">
                  <div className="order-main-header">
                    <Tag
                      className="status-badge"
                      style={{
                        background: statusMap[order.order.order_status]?.bg,
                        color: statusMap[order.order.order_status]?.color,
                      }}
                    >
                      {statusMap[order.order.order_status]?.label}
                    </Tag>
                    <div className="order-id">#DH{order.order.id}</div>
                    <div className="order-time">
                      <CalendarOutlined />{" "}
                      {new Date(order.order.created_at).toLocaleString("vi-VN")}
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="section-title">
                      <UserOutlined /> KHÁCH HÀNG
                    </div>
                    <div className="info-card">
                      <div className="main-val">{order.order.full_name}</div>
                      <div className="sub-val">{order.order.phone}</div>
                      <div className="sub-val">{order.order.email}</div>
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="section-title">
                      <EnvironmentOutlined /> GIAO HÀNG TẠI
                    </div>
                    <div className="info-card address-card">
                      {order.order.address}
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="section-title">
                      <WalletOutlined /> THANH TOÁN
                    </div>
                    <div className="info-card">
                      <div className="payment-method">
                        <CreditCardOutlined />{" "}
                        {order.order.payment_method?.toUpperCase()}
                      </div>
                      {order.order.coupon_code && (
                        <div className="coupon-val">
                          Mã: {order.order.coupon_code}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="section-title">
                      <MessageOutlined /> GHI CHÚ
                    </div>
                    <div className="info-card note-card">
                      {order.order.note || "Không có ghi chú từ khách hàng."}
                    </div>
                  </div>
                </div>
              </Col>

              {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM & TỔNG TIỀN */}
              <Col xs={24} lg={16} className="main-details">
                <div className="details-header">
                  <Title level={4} className="m-0 text-white">
                    CHI TIẾT MẶT HÀNG
                  </Title>
                  <Button
                    icon={<PrinterOutlined />}
                    type="text"
                    className="text-muted"
                  >
                    In hóa đơn
                  </Button>
                </div>

                <div className="table-wrapper">
                  <Table
                    columns={columns}
                    dataSource={order.items}
                    rowKey={(r, i) => i}
                    pagination={false}
                    className="neo-modern-table"
                  />
                </div>

                <div className="summary-footer">
                  <Row justify="end">
                    <Col span={14}>
                      <div className="price-line">
                        <span>Tạm tính</span>
                        <span>
                          {Number(order.order.total_amount).toLocaleString()}đ
                        </span>
                      </div>
                      <div className="price-line discount">
                        <span>Khuyến mãi</span>
                        <span>
                          -
                          {Number(order.order.discount_amount).toLocaleString()}
                          đ
                        </span>
                      </div>
                      <div className="total-line">
                        <div className="total-lbl">TỔNG THANH TOÁN</div>
                        <div className="total-val">
                          {Number(order.order.final_amount).toLocaleString()}{" "}
                          <small>VNĐ</small>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </motion.div>
        ) : null}

        <style>{`
          .wide-neo-modal .ant-modal-content {
            padding: 0 !important;
            border-radius: 20px !important;
            overflow: hidden;
            background: #0a0a0a !important;
            border: 1px solid #222;
          }
          .close-x { color: #ffffff; font-size: 24px; transition: 0.3s; }
          .close-x:hover { color: #FF5302; }

          .loader-box { padding: 120px; text-align: center; }
          .loader-text { margin-top: 20px; font-weight: 900; letter-spacing: 3px; color: #ffffff; font-size: 10px; }

          /* Sidebar trái */
          .sidebar-info {
            background: #111;
            padding: 40px 30px;
            border-right: 1px solid #222;
          }
          .order-main-header { margin-bottom: 35px; }
          .status-badge { border: none; font-weight: 900; font-size: 10px; padding: 4px 12px; border-radius: 4px; margin-bottom: 12px; }
          .order-id { font-size: 32px; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -1px; }
          .order-time { color: #ffffff; font-size: 11px; margin-top: 8px; font-weight: 600; }

          .info-section { margin-bottom: 25px; }
          .section-title { font-size: 10px; font-weight: 800; color: #ffffff; margin-bottom: 12px; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
          .info-card { background: #161616; padding: 15px; border-radius: 12px; border: 1px solid #1f1f1f; }
          .main-val { color: #fff; font-weight: 800; font-size: 15px; }
          .sub-val { color: #ffffff; font-size: 12px; margin-top: 2px; }
          .address-card { color: #FF5302; font-weight: 600; line-height: 1.5; font-size: 13px; }
          .payment-method { color: #3b82f6; font-weight: 900; display: flex; align-items: center; gap: 8px; }
          .note-card { font-style: italic; color: #ffffff; font-size: 12px; }

          /* Cột phải */
          .main-details { padding: 40px; background: #0a0a0a; }
          .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .table-wrapper { margin-bottom: 40px; }
          
          .neo-modern-table .ant-table { background: transparent !important; }
          .neo-modern-table .ant-table-thead > tr > th { 
            background: transparent !important; border-bottom: 1px solid #222 !important; 
            color: #fafafa !important; font-size: 11px !important; font-weight: 800 !important;
          }
          .neo-modern-table .ant-table-tbody > tr > td { border-bottom: 1px solid #161616 !important; padding: 16px 12px !important; }
          
          .product-cell { display: flex; align-items: center; gap: 12px; }
          .product-glow-dot { width: 6px; height: 6px; background: #FF5302; border-radius: 50%; box-shadow: 0 0 12px #FF5302; }
          .p-name { color: #fff; font-weight: 700; font-size: 14px; }
          .p-variant { color: #ffffff; font-size: 11px; }
          .q-val { color: #ffffff; font-weight: 800; font-size: 13px; }
          .p-val { color: #ffffff; font-weight: 600; }
          .t-val { color: #ffffff; font-weight: 800; font-size: 14px; }

          /* Footer tổng tiền */
          .summary-footer { background: #111; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; }
          .price-line { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 700; color: #ffffff; font-size: 13px; }
          .price-line.discount { color: #ef4444; }
          .total-line { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; border-top: 1px solid #222; padding-top: 20px; }
          .total-lbl { font-weight: 900; color: #fff; font-size: 14px; letter-spacing: 1px; }
          .total-val { color: #FF5302; font-size: 42px; font-weight: 900; line-height: 0.8; }
          .total-val small { font-size: 14px; opacity: 0.4; margin-left: 5px; }

          @media (max-width: 992px) {
            .sidebar-info { border-right: none; border-bottom: 1px solid #222; }
            .total-val { font-size: 32px; }
          }
        `}</style>
      </Modal>
    </ConfigProvider>
  );
};

export default OrderDetailModal;
