import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Tag,
  Space,
  Select,
  Spin,
  Descriptions,
  List,
  Card,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import {
  getCustomers,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerById,
} from "../api/customerApi";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FETCH LIST ================= */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers(token, page, 20);
      const filtered = res.data.filter(
        (c) =>
          c.full_name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      );
      setCustomers(filtered);
    } catch {
      message.error("Lỗi tải khách hàng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  /* ================= STATUS ================= */
  const handleStatusChange = async (id, status) => {
    try {
      await updateCustomerStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      await deleteCustomer(customerToDelete.id);
      message.success("Xóa thành công");
      setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      setOpenDelete(false);
    } catch {
      message.error("Xóa thất bại");
    }
  };

  /* ================= DETAIL ================= */
  const viewDetail = async (id) => {
    try {
      const data = await getCustomerById(id);
      setSelectedCustomer(data);
      setOpenDetail(true);
    } catch {
      message.error("Không lấy được chi tiết khách hàng");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "#",
      width: 60,
      render: (_, __, i) => (page - 1) * 20 + i + 1,
    },
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      render: (t) => <b style={{ fontSize: 15 }}>{t}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      render: (t) => t || "—",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      render: (t) => <span style={{ color: "#666" }}>{t || "—"}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s, record) => (
        <Select
          value={s}
          size="small"
          style={{ width: 150 }}
          onChange={(v) => handleStatusChange(record.id, v)}
        >
          <Select.Option value="active">Hoạt động</Select.Option>
          <Select.Option value="inactive">Không hoạt động</Select.Option>
        </Select>
      ),
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button shape="circle" icon={<EyeOutlined />} onClick={() => viewDetail(record.id)} />
          <Button shape="circle" icon={<EditOutlined />} />
          <Button
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              setCustomerToDelete(record);
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0 }}>👥 Quản lý khách hàng</h2>
            <span style={{ color: "#888" }}>
              Theo dõi thông tin và lịch sử mua hàng
            </span>
          </div>

          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm tên hoặc email..."
            style={{
              width: 280,
              borderRadius: 30,
              padding: "6px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={false}
          bordered={false}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </Card>

      {/* DELETE MODAL */}
      <Modal
        open={openDelete}
        onCancel={() => setOpenDelete(false)}
        onOk={confirmDelete}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        title="⚠️ Xác nhận xóa khách hàng"
      >
        Hành động này không thể hoàn tác!
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        title={<b>📋 Chi tiết khách hàng</b>}
      >
        {!selectedCustomer ? (
          <Spin />
        ) : (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Họ tên">
                {selectedCustomer.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedCustomer.email}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {selectedCustomer.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedCustomer.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedCustomer.created_at).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedCustomer.status === "active" ? (
                  <Tag color="green">Hoạt động</Tag>
                ) : (
                  <Tag color="red">Không hoạt động</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* ORDERS */}
            <h3 style={{ marginTop: 20 }}>🧾 Lịch sử mua hàng</h3>

            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {selectedCustomer.orders?.length > 0 ? (
                selectedCustomer.orders.map((order) => (
                  <Card
                    key={order.order_id}
                    style={{
                      marginBottom: 12,
                      borderRadius: 16,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                      border: "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <b>Đơn #{order.order_id}</b>
                      <Tag
                        color={
                          order.status === "completed"
                            ? "green"
                            : order.status === "pending"
                            ? "orange"
                            : "default"
                        }
                      >
                        {order.status}
                      </Tag>
                    </div>

                    <p>🗓 {new Date(order.order_date).toLocaleString()}</p>
                    <p style={{ color: "red", fontWeight: "bold" }}>
                      💰 {Number(order.total_amount).toLocaleString()}₫
                    </p>

                    <List
                      size="small"
                      dataSource={order.items}
                      renderItem={(item) => (
                        <List.Item>
                          {item.product_name} x{item.quantity} —{" "}
                          {Number(item.price).toLocaleString()}₫
                        </List.Item>
                      )}
                    />
                  </Card>
                ))
              ) : (
                <p style={{ color: "#999" }}>Khách hàng chưa có đơn hàng nào.</p>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CustomerList;
