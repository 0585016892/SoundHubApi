import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Card,
  message,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { getOrders, updateOrder, deleteOrder } from "../api/orderApi";
import OrderDetailModal from "../components/OrderDetailModal";

// STATUS MAP
const statusMap = {
  pending: { label: "Chờ xử lý", color: "orange" },
  shipping: { label: "Đang vận chuyển", color: "blue" },
  completed: { label: "Hoàn tất", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
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

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(page, 10, search, statusFilter);
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  /* ================= STATUS UPDATE ================= */
  const handleStatusChange = async (id, status) => {
    try {
      await updateOrder(id, { order_status: status });
      message.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      await deleteOrder(orderToDelete.id);
      message.success("Xóa đơn hàng thành công");
      setOpenDelete(false);
      fetchOrders();
    } catch {
      message.error("Không thể xóa");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "#",
      width: 60,
      render: (_, __, i) => (page - 1) * 10 + i + 1,
    },
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (v) => Number(v).toLocaleString() + "₫",
    },
    {
      title: "Thành tiền",
      dataIndex: "final_amount",
      render: (v) => (
        <span style={{ color: "red", fontWeight: "bold" }}>
          {Number(v).toLocaleString()}₫
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      render: (s, record) =>
        s === "completed" || s === "cancelled" ? (
          <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag>
        ) : (
          <Select
            size="small"
            value={s}
            style={{ width: 160 }}
            onChange={(v) => handleStatusChange(record.id, v)}
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                {val.label}
              </Select.Option>
            ))}
          </Select>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (t) => new Date(t).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder({ id: record.id });
              setOpenDetail(true);
            }}
          />
          <Button
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              setOrderToDelete(record);
              setOpenDelete(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <Card
        style={{
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "none",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2>📦 Quản lý đơn hàng</h2>
            <span style={{ color: "#888" }}>Theo dõi và xử lý đơn hàng</span>
          </div>

          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm tên, email, SĐT..."
              style={{ width: 260, borderRadius: 30 }}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: 200 }}
              onChange={(v) => {
                setStatusFilter(v || "");
                setPage(1);
              }}
            >
              {Object.entries(statusMap).map(([key, val]) => (
                <Select.Option key={key} value={key}>
                  {val.label}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </div>

        {/* TABLE */}
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          bordered={false}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* DELETE MODAL */}
      <Modal
        open={openDelete}
        onCancel={() => setOpenDelete(false)}
        onOk={confirmDelete}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        title="⚠️ Xác nhận xóa đơn hàng"
      >
        Hành động này không thể hoàn tác!
      </Modal>

      {/* DETAIL MODAL */}
      <OrderDetailModal
        show={openDetail}
        handleClose={() => setOpenDetail(false)}
        orderId={selectedOrder?.id}
        statusMap={statusMap}
      />
    </div>
  );
};

export default OrderPage;
