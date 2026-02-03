import React, { useEffect, useState } from "react";
import {
  Modal,
  Spin,
  Tag,
  Row,
  Col,
  Card,
  Table,
  Descriptions,
  Divider,
} from "antd";
import { getOrderById } from "../api/orderApi";
import toast from "react-hot-toast";

// STATUS MAP
const statusMap = {
  pending: { label: "Chờ xử lý", color: "orange" },
  shipping: { label: "Đang vận chuyển", color: "blue" },
  completed: { label: "Hoàn tất", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

const OrderDetailModal = ({ show, handleClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(orderId);
        setOrder({
          ...res,
          items: Array.isArray(res.items) ? res.items : [],
        });
      } catch {
        toast.error("Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  /* ================= TOTAL ================= */
  const subTotal = Number(order?.order?.total_amount || 0);
  const discount = Number(order?.order?.discount_amount || 0);
  const finalTotal = Number(order?.order?.final_amount || 0);

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "#",
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
    },
    {
      title: "Màu",
      dataIndex: "color",
      render: (c) => <Tag>{c}</Tag>,
    },
    {
      title: "SL",
      dataIndex: "quantity",
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (v) => Number(v).toLocaleString() + " ₫",
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      render: (v) => (
        <b style={{ color: "#52c41a" }}>
          {Number(v).toLocaleString()} ₫
        </b>
      ),
    },
  ];

  return (
    <Modal
      open={show}
      onCancel={handleClose}
      footer={null}
      width={1100}
      centered
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>🧾 Đơn hàng #{order?.order?.id}</span>
          {order?.order?.order_status && (
            <Tag color={statusMap[order.order.order_status]?.color}>
              {statusMap[order.order.order_status]?.label}
            </Tag>
          )}
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : order ? (
        <>
          {/* ================= CUSTOMER INFO ================= */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="👤 Thông tin khách hàng" bordered={false}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Họ tên">
                    {order.order.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {order.order.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điện thoại">
                    {order.order.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">
                    {new Date(order.order.created_at).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="💳 Thanh toán" bordered={false}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Phương thức">
                    <Tag color="blue">
                      {order.order.payment_method?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã giảm giá">
                    {order.order.coupon_code ? (
                      <Tag color="green">{order.order.coupon_code}</Tag>
                    ) : (
                      "Không có"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú">
                    {order.order.note || "Không có"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* ================= ADDRESS ================= */}
          <Card title="📍 Địa chỉ giao hàng" bordered={false} style={{ marginTop: 16 }}>
            {order.order.address}
          </Card>

          {/* ================= PRODUCTS ================= */}
          <Divider>🛒 Danh sách sản phẩm</Divider>

          <Table
            columns={columns}
            dataSource={order.items}
            rowKey={(r, i) => i}
            pagination={false}
            scroll={{ y: 280 }}
            bordered
            size="small"
          />

          {/* ================= TOTAL ================= */}
          <Card style={{ marginTop: 16, background: "#fafafa" }} bordered={false}>
            <Row justify="end">
              <Col span={8}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <b>{subTotal.toLocaleString()} ₫</b>
                </div>

                <div className="d-flex justify-content-between mb-2" style={{ color: "red" }}>
                  <span>Giảm giá:</span>
                  <b>- {discount.toLocaleString()} ₫</b>
                </div>

                <Divider />

                <div className="d-flex justify-content-between" style={{ fontSize: 18 }}>
                  <b>Thành tiền:</b>
                  <b style={{ color: "#52c41a" }}>
                    {finalTotal.toLocaleString()} ₫
                  </b>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      ) : (
        <p style={{ textAlign: "center", color: "#999" }}>Không có dữ liệu</p>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
