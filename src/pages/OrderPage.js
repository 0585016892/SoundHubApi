import React, { useEffect, useState } from "react";
import {
  Table, Button, Input, Select, Tag, Space, Modal, Card, 
  message, Typography, ConfigProvider, Row, Col, theme
} from "antd";
import {
  EyeOutlined, DeleteOutlined, SearchOutlined,
  FilterOutlined, ShoppingCartOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { getOrders, updateOrder, deleteOrder } from "../api/orderApi";
import OrderDetailModal from "../components/OrderDetailModal";

const { Title, Text } = Typography;

const statusMap = {
  pending: { label: "CHỜ XỬ LÝ", color: "orange" },
  shipping: { label: "ĐANG GIAO", color: "blue" },
  completed: { label: "HOÀN TẤT", color: "green" },
  cancelled: { label: "ĐÃ HỦY", color: "red" },
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(page, 10, search, statusFilter);
      setOrders(res?.data || []);
      setTotal(res?.total || 0);
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrder(id, { order_status: status });
      message.success("Đã cập nhật trạng thái");
      fetchOrders();
    } catch {
      message.error("Lỗi cập nhật");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder(orderToDelete.id);
      message.success("Đã xóa đơn hàng");
      setOpenDelete(false);
      fetchOrders();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const columns = [
    {
      title: <Text style={{ color: "#888" }}>ID</Text>,
      width: 80,
      render: (_, record) => <Text style={{ color: "#888" }}>#{record.id}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>KHÁCH HÀNG</Text>,
      render: (_, record) => (
        <div>
          <Text style={{ color: "#fff", fontWeight: "600", display: 'block' }}>
            {(record.full_name || "N/A").toUpperCase()}
          </Text>
          <Text style={{ color: "#666", fontSize: 12 }}>{record.phone || record.email}</Text>
        </div>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THÀNH TIỀN</Text>,
      dataIndex: "final_amount",
      render: (v) => (
        <Text style={{ color: "#ff6600", fontWeight: "bold", fontSize: 15 }}>
          {Number(v || 0).toLocaleString()}₫
        </Text>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>TRẠNG THÁI</Text>,
      dataIndex: "order_status",
      render: (s, record) => {
        const config = statusMap[s] || { label: "TRỐNG", color: "default" };
        if (s === "completed" || s === "cancelled") {
          return <Tag color={config.color} style={{ border: 'none' }}>{config.label}</Tag>;
        }
        return (
          <Select
            size="small"
            value={s}
            bordered={false}
            className="dark-select"
            dropdownStyle={{ background: '#1a1a1a' }}
            style={{ width: 150, background: '#1a1a1a', borderRadius: 4, color: '#fff' }}
            onChange={(v) => handleStatusChange(record.id, v)}
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                <span style={{ color: '#fff' }}>{val.label}</span>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: <Text style={{ color: "#888" }}>THỜI GIAN</Text>,
      dataIndex: "created_at",
      render: (t) => <Text style={{ color: "#666" }}>{new Date(t).toLocaleString("vi-VN")}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>THAO TÁC</Text>,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            ghost
            icon={<EyeOutlined style={{ color: '#ff6600' }} />}
            style={{ borderColor: '#333' }}
            onClick={() => { setSelectedOrder({ id: record.id }); setOpenDetail(true); }}
          />
          <Button
            danger
            ghost
            icon={<DeleteOutlined />}
            onClick={() => { setOrderToDelete(record); setOpenDelete(true); }}
          />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm, // Kích hoạt chế độ tối mặc định của AntD
        token: {
          colorBgContainer: "#141414",
          colorText: "#ffffff",
          colorPrimary: "#ff6600",
          colorBorder: "#333333",
          colorTextPlaceholder: "#555555",
        },
        components: {
          Table: {
            headerBg: "#1a1a1a",
            headerColor: "#888888",
            rowHoverBg: "#1f1f1f",
          },
          Select: {
            optionSelectedColor: "#ff6600",
            selectorBg: "#0a0a0a",
          }
        }
      }}
    >
      <div style={{ padding: "24px", background: "#0a0a0a", minHeight: "100vh", color: '#fff' }}>
        
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <ShoppingCartOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Quản lý Đơn hàng
            </Title>
            <Text style={{ color: "#555" }}>Xử lý quy trình vận chuyển và thanh toán khách hàng</Text>
          </Col>
          
          <Col>
            <Space size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
                placeholder="Tìm tên, email, SĐT..."
                style={{ width: 280, borderRadius: 20, background: '#141414', border: '1px solid #333', color: '#fff' }}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                allowClear
              />
              <Select
                allowClear
                placeholder={<span style={{ color: '#555' }}><FilterOutlined /> Lọc trạng thái</span>}
                style={{ width: 200, background: '#141414' }}
                dropdownStyle={{ background: '#141414' }}
                onChange={(v) => { setStatusFilter(v || ""); setPage(1); }}
              >
                {Object.entries(statusMap).map(([key, val]) => (
                  <Select.Option key={key} value={key}><span style={{ color: '#fff' }}>{val.label}</span></Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>

        {/* TABLE */}
        <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: 10,
              total,
              onChange: (p) => setPage(p),
              style: { marginRight: 16 }
            }}
          />
        </div>

        {/* DELETE MODAL */}
        <Modal
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onOk={confirmDelete}
          title={<span style={{ color: "#fff" }}>⚠️ XÁC NHẬN HỦY ĐƠN</span>}
          okText="XÓA VĨNH VIỄN"
          cancelText="QUAY LẠI"
          okButtonProps={{ danger: true }}
        >
          <Text style={{ color: "#ccc" }}>
            Đơn hàng của khách <b style={{ color: '#ff6600' }}>{orderToDelete?.full_name}</b> sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác!
          </Text>
        </Modal>

        <OrderDetailModal
          show={openDetail}
          handleClose={() => setOpenDetail(false)}
          orderId={selectedOrder?.id}
          statusMap={statusMap}
        />

        {/* CSS OVERRIDES FOR ICONS AND TEXT */}
        <style>{`
          /* Biến mọi icon Antd sang màu cam hoặc xám sáng */
          .anticon { vertical-align: middle; }
          .ant-input-affix-wrapper .anticon { color: #ff6600 !important; }
          
          /* Pagination text color */
          .ant-pagination-item a { color: #888 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }
          .ant-pagination-prev .ant-pagination-item-link, 
          .ant-pagination-next .ant-pagination-item-link { color: #888 !important; }

          /* Table Empty state text */
          .ant-empty-description { color: #555 !important; }

          /* Modal header and close button */
          .ant-modal-header { border-bottom: 1px solid #222 !important; }
          .ant-modal-close-icon { color: #fff !important; }

          /* Select arrow icon */
          .ant-select-arrow { color: #ff6600 !important; }

          /* Loại bỏ viền xanh khi focus */
          .ant-input:focus, .ant-input-focused, .ant-select:focus {
            border-color: #ff6600 !important;
            box-shadow: none !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default OrderPage;