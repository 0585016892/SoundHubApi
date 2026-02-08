import React, { useEffect, useState } from "react";
import {
  Modal, Spin, Tag, Row, Col, Card, Table, Descriptions, 
  Divider, Typography, ConfigProvider, theme,Space
} from "antd";
import { 
  UserOutlined, CreditCardOutlined, EnvironmentOutlined, 
  ShoppingOutlined, CalendarOutlined, MessageOutlined 
} from "@ant-design/icons";
import { getOrderById } from "../api/orderApi";
import toast from "react-hot-toast";

const { Text, Title } = Typography;

const statusMap = {
  pending: { label: "CHỜ XỬ LÝ", color: "orange" },
  shipping: { label: "ĐANG VẬN CHUYỂN", color: "blue" },
  completed: { label: "HOÀN TẤT", color: "green" },
  cancelled: { label: "ĐÃ HỦY", color: "red" },
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
        setOrder({
          ...res,
          items: Array.isArray(res.items) ? res.items : [],
        });
      } catch {
        toast.error("Lỗi truy xuất chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, show]);

  const subTotal = Number(order?.order?.total_amount || 0);
  const discount = Number(order?.order?.discount_amount || 0);
  const finalTotal = Number(order?.order?.final_amount || 0);

  const columns = [
    {
      title: <Text style={{ color: "#888" }}>SẢN PHẨM</Text>,
      dataIndex: "product_name",
      render: (t) => <Text style={{ color: "#fff", fontWeight: 500 }}>{t}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>PHÂN LOẠI</Text>,
      dataIndex: "color",
      render: (c) => <Tag color="#333" style={{ border: '1px solid #444', color: '#aaa' }}>{c}</Tag>,
    },
    {
      title: <Text style={{ color: "#888" }}>SL</Text>,
      dataIndex: "quantity",
      align: 'center',
      render: (q) => <Text style={{ color: "#fff" }}>x{q}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>ĐƠN GIÁ</Text>,
      dataIndex: "price",
      align: 'right',
      render: (v) => <Text style={{ color: "#aaa" }}>{Number(v).toLocaleString()}₫</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>THÀNH TIỀN</Text>,
      dataIndex: "total",
      align: 'right',
      render: (v) => <Text style={{ color: "#ff6600", fontWeight: "bold" }}>{Number(v).toLocaleString()}₫</Text>,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "#141414",
          colorBorderSecondary: "#222",
        }
      }}
    >
      <Modal
        open={show}
        onCancel={handleClose}
        footer={null}
        width={1000}
        centered
        closeIcon={<span style={{ color: '#fff' }}>×</span>}
        title={
          <Space>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: 'bold' }}>
              🧾 CHI TIẾT ĐƠN HÀNG #{order?.order?.id}
            </Text>
            {order?.order?.order_status && (
              <Tag color={statusMap[order.order.order_status]?.color} style={{ border: 'none' }}>
                {statusMap[order.order.order_status]?.label}
              </Tag>
            )}
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" tip="Đang trích xuất dữ liệu..." />
          </div>
        ) : order ? (
          <div style={{ marginTop: 20 }}>
            <Row gutter={[24, 24]}>
              {/* KHÁCH HÀNG */}
              <Col span={12}>
                <Card 
                  size="small" 
                  title={<Space><UserOutlined style={{ color: '#ff6600' }} /><span style={{ color: '#fff' }}>Khách hàng</span></Space>}
                  style={{ background: '#0a0a0a', border: '1px solid #222' }}
                >
                  <Descriptions column={1} size="small" className="dark-descriptions">
                    <Descriptions.Item label="Họ tên">{order.order.full_name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.order.email}</Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">{order.order.phone}</Descriptions.Item>
                    <Descriptions.Item label={<Space><CalendarOutlined /> Ngày đặt</Space>}>
                      {new Date(order.order.created_at).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* THANH TOÁN */}
              <Col span={12}>
                <Card 
                  size="small" 
                  title={<Space><CreditCardOutlined style={{ color: '#ff6600' }} /><span style={{ color: '#fff' }}>Giao dịch</span></Space>}
                  style={{ background: '#0a0a0a', border: '1px solid #222' }}
                >
                  <Descriptions column={1} size="small" className="dark-descriptions">
                    <Descriptions.Item label="Phương thức">
                      <Tag color="blue" style={{ border: 'none' }}>{order.order.payment_method?.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã giảm giá">
                      {order.order.coupon_code ? <Tag color="green">{order.order.coupon_code}</Tag> : <Text type="secondary">Không có</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label={<Space><MessageOutlined /> Ghi chú</Space>}>
                      <Text style={{ color: '#888' }}>{order.order.note || "Trống"}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* ĐỊA CHỈ */}
              <Col span={24}>
                <Card 
                  size="small"
                  style={{ background: '#0a0a0a', border: '1px solid #222' }}
                >
                   <Space align="start">
                      <EnvironmentOutlined style={{ color: '#ff6600', marginTop: 4 }} />
                      <div>
                        <Text style={{ color: '#888', display: 'block', marginBottom: 4 }}>Địa chỉ giao hàng:</Text>
                        <Text style={{ color: '#fff' }}>{order.order.address}</Text>
                      </div>
                   </Space>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left" style={{ borderColor: '#222' }}>
              <Space><ShoppingOutlined style={{ color: '#ff6600' }} /><span style={{ color: '#888', fontSize: 13 }}>DANH MỤC SẢN PHẨM</span></Space>
            </Divider>

            <Table
              columns={columns}
              dataSource={order.items}
              rowKey={(r, i) => i}
              pagination={false}
              size="small"
              className="dark-table"
              style={{ marginBottom: 24 }}
            />

            {/* TỔNG KẾT */}
            <Row justify="end">
              <Col span={10}>
                <div style={{ background: '#0a0a0a', padding: 20, borderRadius: 12, border: '1px solid #222' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#666' }}>Tạm tính:</Text>
                    <Text style={{ color: '#fff' }}>{subTotal.toLocaleString()}₫</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#666' }}>Khuyến mãi:</Text>
                    <Text style={{ color: '#ff4d4f' }}>-{discount.toLocaleString()}₫</Text>
                  </div>
                  <Divider style={{ margin: '12px 0', borderColor: '#222' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ color: '#fff', margin: 0 }}>TỔNG CỘNG:</Title>
                    <Title level={3} style={{ color: '#ff6600', margin: 0 }}>
                      {finalTotal.toLocaleString()}₫
                    </Title>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 50, color: '#444' }}>Không tìm thấy dữ liệu đơn hàng</div>
        )}

        <style>{`
          .dark-descriptions .ant-descriptions-item-label { color: #666 !important; font-weight: normal !important; }
          .dark-descriptions .ant-descriptions-item-content { color: #fff !important; }
          .dark-table .ant-table { background: transparent !important; }
          .dark-table .ant-table-thead > tr > th { background: #0a0a0a !important; border-bottom: 1px solid #222 !important; }
          .dark-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1a1a1a !important; }
          .ant-modal-content { border: 1px solid #333 !important; box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important; }
        `}</style>
      </Modal>
    </ConfigProvider>
  );
};

export default OrderDetailModal;