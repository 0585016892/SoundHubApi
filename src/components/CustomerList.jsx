import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Input, Tag, Space, Select, Spin, 
  Descriptions, List, Card, message, Typography, ConfigProvider, Row, Col, Divider
} from "antd";
import {
  EyeOutlined, DeleteOutlined, SearchOutlined,
  UserOutlined, HistoryOutlined, IdcardOutlined, ShoppingCartOutlined,
  MailOutlined, PhoneOutlined, HomeOutlined
} from "@ant-design/icons";

import {
  getCustomers,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerById,
} from "../api/customerApi";

const { Title, Text } = Typography;

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
      // Kiểm tra dữ liệu an toàn trước khi filter
      const dataArray = res?.data || [];
      const filtered = dataArray.filter(
        (c) =>
          (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(search.toLowerCase())
      );
      setCustomers(filtered);
    } catch (err) {
      message.error("Không thể kết nối danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  /* ================= STATUS CHANGE ================= */
  const handleStatusChange = async (id, status) => {
    try {
      await updateCustomerStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch {
      message.error("Lỗi cập nhật trạng thái");
    }
  };

  /* ================= DELETE LOGIC ================= */
  const confirmDelete = async () => {
    try {
      await deleteCustomer(customerToDelete.id);
      message.success("Đã xóa khách hàng khỏi hệ thống");
      setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      setOpenDelete(false);
    } catch {
      message.error("Xóa thất bại");
    }
  };

  /* ================= VIEW DETAIL ================= */
  const viewDetail = async (id) => {
    setSelectedCustomer(null); // Reset dữ liệu cũ
    setOpenDetail(true);
    try {
      const data = await getCustomerById(id);
      setSelectedCustomer(data);
    } catch {
      message.error("Lỗi lấy dữ liệu chi tiết");
      setOpenDetail(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: <Text style={{ color: "#888" }}>#</Text>,
      width: 70,
      render: (_, __, i) => <Text style={{ color: "#555" }}>{(page - 1) * 20 + i + 1}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>KHÁCH HÀNG</Text>,
      dataIndex: "full_name",
      render: (t, record) => (
        <Space>
          <div style={{ 
            width: 35, height: 35, borderRadius: '50%', background: '#1a1a1a', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' 
          }}>
            <UserOutlined style={{ color: '#ff6600' }} />
          </div>
          <Text style={{ color: "#fff", fontWeight: "600" }}>{t || "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>EMAIL / ĐIỆN THOẠI</Text>,
      render: (_, record) => (
        <div>
          <Text style={{ color: "#eee", display: 'block' }}>{record.email}</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>{record.phone || "Trống"}</Text>
        </div>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>TRẠNG THÁI</Text>,
      dataIndex: "status",
      render: (s, record) => (
        <Select
          value={s}
          size="small"
          bordered={false}
          style={{ width: 140, background: '#1a1a1a', borderRadius: 4 }}
          onChange={(v) => handleStatusChange(record.id, v)}
        >
          <Select.Option value="active"><Tag color="success">HOẠT ĐỘNG</Tag></Select.Option>
          <Select.Option value="inactive"><Tag color="default">VÔ HIỆU HÓA</Tag></Select.Option>
        </Select>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THAO TÁC</Text>,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button ghost icon={<EyeOutlined />} style={{ color: '#ff6600', borderColor: '#ff6600' }} onClick={() => viewDetail(record.id)} />
          <Button danger ghost icon={<DeleteOutlined />} onClick={() => { setCustomerToDelete(record); setOpenDelete(true); }} />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: "#141414", colorText: "#fff", colorPrimary: "#ff6600", colorBorder: "#333" },
        components: {
          Table: { headerBg: "#1a1a1a", rowHoverBg: "#1f1f1f" },
          Modal: { contentBg: "#141414", headerBg: "#141414" },
          Input: { colorBgContainer: "#0a0a0a", colorText: "#fff" }
        }
      }}
    >
      <div style={{ padding: "24px", background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER SECTION */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <IdcardOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Quản lý Khách hàng
            </Title>
            <Text style={{ color: "#666" }}>Dữ liệu định danh khách hàng & Lịch sử giao dịch</Text>
          </Col>
          <Col>
            <Input
              prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
              placeholder="Tìm tên hoặc email..."
              style={{ width: 320, borderRadius: 20, background: '#141414', border: '1px solid #333', color: '#fff' }}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        {/* DATA TABLE */}
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, position: ['bottomRight'] }}
          />
        </div>

        {/* DELETE CONFIRM MODAL */}
        <Modal
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onOk={confirmDelete}
          title={<span style={{ color: "#fff" }}>XÁC NHẬN GỠ BỎ</span>}
          okText="XÓA KHÁCH HÀNG"
          cancelText="HỦY"
          okButtonProps={{ danger: true }}
        >
          <Text style={{ color: "#fff" }}>
            Bạn có chắc chắn muốn xóa khách hàng <b style={{ color: '#ff6600' }}>{customerToDelete?.full_name}</b>? 
            Mọi lịch sử mua hàng liên quan sẽ bị ẩn khỏi danh sách quản trị.
          </Text>
        </Modal>

        {/* CUSTOMER DETAIL MODAL */}
        <Modal
          open={openDetail}
          onCancel={() => setOpenDetail(false)}
          footer={null}
          width={1000}
          title={<Space><HistoryOutlined style={{ color: "#ff6600" }} /><span style={{ color: "#fff" }}>CHI TIẾT HỒ SƠ & LỊCH SỬ</span></Space>}
        >
          {!selectedCustomer ? (
            <div style={{ padding: 50, textAlign: 'center' }}><Spin tip="Đang truy xuất dữ liệu..." /></div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <Row gutter={24}>
                <Col span={9}>
                  <Card style={{ background: '#0a0a0a', border: '1px solid #222' }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <div style={{ 
                        width: 70, height: 70, borderRadius: '50%', background: '#141414', 
                        margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ff6600' 
                      }}>
                        <UserOutlined style={{ fontSize: 35, color: '#ff6600' }} />
                      </div>
                      <Title level={4} style={{ color: '#fff', margin: 0 }}>{selectedCustomer.full_name}</Title>
                      <Tag color="orange" style={{ marginTop: 8 }}>MEMBER</Tag>
                    </div>

                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div><Text type="secondary"><MailOutlined /> Email:</Text><br/><Text>{selectedCustomer.email}</Text></div>
                      <div><Text type="secondary"><PhoneOutlined /> Điện thoại:</Text><br/><Text>{selectedCustomer.phone || "Chưa có"}</Text></div>
                      <div><Text type="secondary"><HomeOutlined /> Địa chỉ:</Text><br/><Text>{selectedCustomer.address || "Chưa cập nhật"}</Text></div>
                      <div><Text type="secondary">📅 Ngày gia nhập:</Text><br/><Text>{new Date(selectedCustomer.created_at).toLocaleDateString()}</Text></div>
                    </Space>
                  </Card>
                </Col>

                <Col span={15}>
                  <div style={{ background: '#141414', padding: '15px', borderRadius: '8px', border: '1px solid #222' }}>
                    <Title level={5} style={{ color: '#fff' }}><ShoppingCartOutlined /> LỊCH SỬ GIAO DỊCH</Title>
                    <Divider style={{ borderColor: '#333', margin: '12px 0' }} />

                    <div style={{ maxHeight: 450, overflowY: "auto", paddingRight: 8 }}>
                      {selectedCustomer.orders?.length > 0 ? (
                        selectedCustomer.orders.map((order) => (
                          <Card
                            key={order.order_id}
                            size="small"
                            style={{ marginBottom: 15, background: "#0a0a0a", border: "1px solid #333" }}
                            title={<span style={{ color: '#ff6600' }}>Đơn hàng #{order.order_id}</span>}
                            extra={<Tag color={order.status === 'completed' ? 'green' : 'orange'}>{order.status?.toUpperCase()}</Tag>}
                          >
                            <Row justify="space-between" style={{ marginBottom: 10 }}>
                              <Col><Text style={{ color: '#666' }}>Ngày đặt: {new Date(order.order_date).toLocaleDateString()}</Text></Col>
                              <Col><Text style={{ color: '#ff6600', fontWeight: 'bold' }}>{Number(order.total_amount).toLocaleString()}₫</Text></Col>
                            </Row>
                            <List
                              size="small"
                              dataSource={order.items || []}
                              renderItem={(item) => (
                                <List.Item style={{ borderBottom: '1px dashed #222', padding: '4px 0' }}>
                                  <Text style={{ color: '#ccc', fontSize: 13 }}>{item.product_name} <Text style={{ color: '#555' }}>x{item.quantity}</Text></Text>
                                  <Text style={{ color: '#888' }}>{Number(item.price).toLocaleString()}₫</Text>
                                </List.Item>
                              )}
                            />
                          </Card>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: 40 }}><Text style={{ color: '#444' }}>Khách hàng chưa có giao dịch nào.</Text></div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* CSS Fixes */}
        <style>{`
          .ant-table-cell { border-bottom: 1px solid #1f1f1f !important; }
          .ant-descriptions-item-label { background: #1a1a1a !important; color: #888 !important; }
          .ant-descriptions-item-content { color: #fff !important; }
          .ant-pagination-item-active { border-color: #ff6600 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-track { background: #0a0a0a; }
          ::-webkit-scrollbar-thumb { background: #333; borderRadius: 10px; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CustomerList;