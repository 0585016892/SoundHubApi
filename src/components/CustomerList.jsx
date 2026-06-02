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
  List,
  Card,
  Typography,
  ConfigProvider,
  Row,
  Col,
  Divider,
  theme,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  HistoryOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  ContainerOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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
      const dataArray = res?.data || [];
      const filtered = dataArray.filter(
        (c) =>
          (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(search.toLowerCase()),
      );
      setCustomers(filtered);
    } catch (err) {
      toast.error("Không thể kết nối danh sách khách hàng");
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
      toast.success("Cập nhật trạng thái thành công");
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      );
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  /* ================= DELETE LOGIC ================= */
  const confirmDelete = async () => {
    try {
      await deleteCustomer(customerToDelete.id);
      toast.success("Đã xóa khách hàng khỏi hệ thống");
      setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      setOpenDelete(false);
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  /* ================= VIEW DETAIL ================= */
  const viewDetail = async (id) => {
    setSelectedCustomer(null);
    setOpenDetail(true);
    try {
      const data = await getCustomerById(id);
      setSelectedCustomer(data);
    } catch {
      toast.error("Lỗi lấy dữ liệu chi tiết");
      setOpenDetail(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "INDEX",
      width: 90,
      align: "center",
      render: (_, __, i) => (
        <span className="index-badge">{(page - 1) * 20 + i + 1}</span>
      ),
    },
    {
      title: "DANH TÍNH KHÁCH HÀNG",
      dataIndex: "full_name",
      render: (t, record) => (
        <Space size="middle" className="customer-profile-cell">
          <div className="avatar-glow-wrapper">
            <UserOutlined />
          </div>
          <div>
            <div className="c-name-main">{t || "ẨN DANH"}</div>
            <div className="c-id-sub">UID: #CUST-{record.id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "HỒ SƠ LIÊN LẠC",
      render: (_, record) => (
        <div className="contact-cell">
          <span className="email-txt">
            <MailOutlined /> {record.email}
          </span>
          <span className="phone-txt">
            <PhoneOutlined /> {record.phone || "---"}
          </span>
        </div>
      ),
    },
    {
      title: "QUYỀN TRUY CẬP",
      dataIndex: "status",
      width: 200,
      render: (s, record) => (
        <Select
          value={s}
          bordered={false}
          className="neo-select-status"
          dropdownClassName="neo-select-dropdown"
          onChange={(v) => handleStatusChange(record.id, v)}
        >
          <Select.Option value="active">
            <span className="status-dot active">●</span> HOẠT ĐỘNG
          </Select.Option>
          <Select.Option value="inactive">
            <span className="status-dot inactive">●</span> VÔ HIỆU HÓA
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "THAO TÁC PANEL",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="btn-action-view"
            icon={<EyeOutlined />}
            onClick={() => viewDetail(record.id)}
          />
          <Button
            type="text"
            danger
            className="btn-action-delete"
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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "#111111",
          colorText: "#e5e5e5",
          colorPrimary: "#ff5302",
          colorBorder: "#222222",
        },
      }}
    >
      <div className="admin-bento-layout">
        {/* HEADER CONTROLS */}
        <div className="filter-bento-bar mb-4">
          <Row gutter={[24, 16]} justify="space-between" align="middle">
            <Col xs={24} md={14}>
              <div className="page-headline-block">
                <Title level={2} className="m-0 page-main-title">
                  <IdcardOutlined className="title-icon" /> Quản Lý Khách Hàng
                </Title>
                <Text className="text-muted letter-spacing-1">
                  Cơ sở dữ liệu định danh khách hàng và phân tích lịch sử giao
                  dịch
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm định danh tên, hòm thư email..."
                className="neo-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </Col>
          </Row>
        </div>

        {/* DATA CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="table-bento-container"
        >
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="id"
            loading={loading}
            className="custom-neo-table"
            pagination={{ pageSize: 20, showSizeChanger: false }}
          />
        </motion.div>

        {/* DELETE MODAL */}
        <Modal
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onOk={confirmDelete}
          title={
            <span className="modal-danger-title">
              ⚠️ THU HỒI QUYỀN TRUY CẬP
            </span>
          }
          okText="GỠ BỎ VĨNH VIỄN"
          cancelText="QUAY LẠI"
          centered
          okButtonProps={{ danger: true, className: "btn-modal-danger-ok" }}
          cancelButtonProps={{ className: "btn-modal-danger-cancel" }}
        >
          <div className="py-2">
            <Text style={{ color: "#aaa" }}>
              Hệ thống sẽ thực hiện ngắt kết nối tài khoản của{" "}
              <strong style={{ color: "#ff5302" }}>
                {customerToDelete?.full_name}
              </strong>
              . Mọi tiến trình lịch sử mua sắm sẽ bị lưu trữ riêng lẻ. Bạn chắc
              chắn?
            </Text>
          </div>
        </Modal>

        {/* WIDE SIDE-BY-SIDE DETAIL MODAL */}
        <Modal
          open={openDetail}
          onCancel={() => setOpenDetail(false)}
          footer={null}
          width={1250}
          centered
          className="wide-neo-modal"
          closeIcon={<span className="close-x">×</span>}
        >
          {!selectedCustomer ? (
            <div className="loader-box">
              <Spin size="large" />
              <div className="loader-text">DECODING PROFILE...</div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="modal-inner"
            >
              <Row gutter={0}>
                {/* TRÁI: THẺ ĐỊNH DANH PROFILE */}
                <Col xs={24} lg={8} className="sidebar-info">
                  <div className="sticky-content">
                    <div className="customer-main-header">
                      <div className="profile-glow-avatar">
                        <UserOutlined />
                      </div>
                      <div className="customer-name">
                        {selectedCustomer.full_name}
                      </div>
                      <Tag color="orange" className="status-badge">
                        MEMBER PROFILE
                      </Tag>
                    </div>

                    <div className="info-section">
                      <div className="section-title">
                        <ContainerOutlined /> THÔNG TIN LIÊN HỆ
                      </div>
                      <div className="info-card">
                        <div className="info-row">
                          <span className="lbl">
                            <MailOutlined /> Email
                          </span>
                          <span className="val highlight">
                            {selectedCustomer.email}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="lbl">
                            <PhoneOutlined /> Điện thoại
                          </span>
                          <span className="val highlight">
                            {selectedCustomer.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="section-title">
                        <HomeOutlined /> ĐỊA CHỈ MẶC ĐỊNH
                      </div>
                      <div className="info-card address-card">
                        {selectedCustomer.address ||
                          "Hồ sơ chưa cập nhật trường dữ liệu địa chỉ."}
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="section-title">
                        <CalendarOutlined /> THỜI GIAN GIA NHẬP
                      </div>
                      <div className="info-card note-card">
                        Hệ thống ghi nhận khởi tạo ngày{" "}
                        {new Date(
                          selectedCustomer.created_at,
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* PHẢI: LỊCH SỬ GIAO DỊCH NGANG RỘNG */}
                <Col xs={24} lg={16} className="main-details">
                  <div className="details-header">
                    <Title
                      level={4}
                      className="m-0 text-white"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <ShoppingCartOutlined style={{ color: "#ff5302" }} /> LỊCH
                      SỬ PHÁT SINH GIAO DỊCH
                    </Title>
                    <span className="count-badge">
                      Tổng cộng: {selectedCustomer.orders?.length || 0} Đơn
                    </span>
                  </div>

                  <div className="timeline-orders-container">
                    {selectedCustomer.orders?.length > 0 ? (
                      selectedCustomer.orders.map((order) => (
                        <div
                          key={order.order_id}
                          className="neo-order-bento-card"
                        >
                          <div className="order-bento-top">
                            <div>
                              <span className="o-id">#DH-{order.order_id}</span>
                              <span className="o-date">
                                {new Date(order.order_date).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                            <Tag
                              bordered={false}
                              className={`neo-tag-${order.status}`}
                              color={
                                order.status === "completed"
                                  ? "green"
                                  : "orange"
                              }
                            >
                              {order.status?.toUpperCase()}
                            </Tag>
                          </div>

                          <div className="order-items-list">
                            <List
                              size="small"
                              dataSource={order.items || []}
                              renderItem={(item) => (
                                <List.Item className="neo-item-row">
                                  <div className="item-left">
                                    <ArrowRightOutlined className="arrow-bullet" />
                                    <span className="item-name">
                                      {item.product_name}
                                    </span>
                                    <span className="item-qty">
                                      ×{item.quantity}
                                    </span>
                                  </div>
                                  <span className="item-price">
                                    {Number(item.price).toLocaleString()}đ
                                  </span>
                                </List.Item>
                              )}
                            />
                          </div>

                          <div className="order-bento-bottom">
                            <span className="b-lbl">TỔNG GIÁ TRỊ LỆNH</span>
                            <span className="b-val">
                              {Number(order.total_amount).toLocaleString()}{" "}
                              <small>đ</small>
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-history-box">
                        <HistoryOutlined className="empty-icon" />
                        <div>
                          Không tìm thấy dữ liệu hóa đơn phát sinh cho tài khoản
                          này.
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </motion.div>
          )}
        </Modal>

        <style>{`
          .admin-bento-layout { padding: 30px; background: #080808; min-height: 100vh; color: #e5e5e5; font-family: 'Inter', sans-serif; }
          .page-main-title { font-weight: 900 !important; letter-spacing: -1px; color: #fff !important; display: flex; align-items: center; }
          .title-icon { color: #ff5302; margin-right: 12px; }
          .letter-spacing-1 { letter-spacing: 0.5px; font-size: 11px; font-weight: 700; color: #ffff !important; display: block; margin-top: 4px; }

          /* Filter Bar */
          .filter-bento-bar { background: #111; border: 1px solid #222; border-radius: 16px; padding: 20px; }
          .neo-search-input { background: #161616 !important; border: 1px solid #262626 !important; border-radius: 10px !important; padding: 10px 14px !important; color: #fff !important; }
          .neo-search-input .anticon { color: #ff5302 !important; }

          /* Table Bento UI */
          .table-bento-container { background: #111; border: 1px solid #222; border-radius: 20px; overflow: hidden; }
          .custom-neo-table .ant-table { background: transparent !important; }
          .custom-neo-table .ant-table-thead > tr > th { font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.5px; border-bottom: 1px solid #222 !important; padding: 18px 20px !important; color: #ffff !important; background: #161616 !important; }
          .custom-neo-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1a1a1a !important; padding: 16px 20px !important; }

          .index-badge { color: #ffff; font-weight: 800; font-size: 12px; }
          .avatar-glow-wrapper { width: 36px; height: 36px; border-radius: 50%; background: #161616; border: 1px solid rgba(255, 83, 2, 0.3); display: flex; align-items: center; justify-content: center; color: #ff5302; box-shadow: 0 0 10px rgba(255, 83, 2, 0.05); }
          .c-name-main { font-weight: 700; color: #fff; font-size: 14px; }
          .c-id-sub { font-size: 11px; color: #ffff; font-weight: 600; margin-top: 1px; }
          .contact-cell .email-txt { display: block; color: #eee; font-weight: 500; font-size: 13px; }
          .contact-cell .phone-txt { display: block; color: #ffff; font-size: 11px; margin-top: 2px; font-weight: 700; }

          /* Status Selector Custom styling */
          .neo-select-status { background: #161616; border: 1px solid #262626; border-radius: 8px; width: 150px; }
          .neo-select-status .ant-select-selection-item { font-weight: 800 !important; font-size: 11px !important; color: #fff !important; }
          .status-dot { margin-right: 6px; }
          .status-dot.active { color: #22c55e; }
          .status-dot.inactive { color: #efffff4; }

          .btn-action-view { background: #161616 !important; color: #ff5302 !important; border-radius: 8px; }
          .btn-action-view:hover { background: rgba(255, 83, 2, 0.1) !important; }
          .btn-action-delete { background: #161616 !important; color: #efffff4 !important; border-radius: 8px; }
          .btn-action-delete:hover { background: rgba(239, 68, 68, 0.1) !important; }

          /* WIDE MODAL LAYOUT */
          .wide-neo-modal .ant-modal-content { padding: 0 !important; border-radius: 24px !important; overflow: hidden; background: #0a0a0a !important; border: 1px solid #222; }
          .close-x { color: #ffff; font-size: 24px; cursor: pointer; transition: 0.2s; }
          .close-x:hover { color: #ff5302; }
          .loader-box { padding: 120px; text-align: center; }
          .loader-text { margin-top: 20px; font-weight: 900; letter-spacing: 2px; color: #ffff; font-size: 10px; }

          /* Left Sidebar (Profile Block) */
          .sidebar-info { background: #111; padding: 40px 30px; border-right: 1px solid #222; }
          .customer-main-header { text-align: center; margin-bottom: 35px; }
          .profile-glow-avatar { width: 70px; height: 70px; border-radius: 50%; background: #161616; border: 2px solid #ff5302; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #ff5302; box-shadow: 0 0 20px rgba(255, 83, 2, 0.15); }
          .customer-name { font-size: 20px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
          .status-badge { border: none; font-weight: 900; font-size: 10px; padding: 2px 10px; border-radius: 4px; margin-top: 8px; background: rgba(255, 83, 2, 0.1); color: #ff5302; }
          
          .info-section { margin-bottom: 25px; }
          .section-title { font-size: 10px; font-weight: 800; color: #ffff; margin-bottom: 12px; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
          .info-card { background: #161616; padding: 16px; border-radius: 12px; border: 1px solid #1f1f1f; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-row:last-child { margin-bottom: 0; }
          .info-row .lbl { color: #ffff; font-size: 12px; font-weight: 600; }
          .info-row .val { color: #aaa; font-size: 12px; font-weight: 600; }
          .info-row .val.highlight { color: #fff; font-weight: 700; }
          .address-card { color: #eee; font-size: 12.5px; font-weight: 600; line-height: 1.5; }
          .note-card { font-style: italic; color: #ffff; font-size: 12px; font-weight: 500; }

          /* Right Main (Orders List Block) */
          .main-details { padding: 40px; background: #0a0a0a; display: flex; flex-direction: column; }
          .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #161616; }
          .count-badge { font-size: 11px; font-weight: 800; color: #ffff; background: #111; padding: 4px 12px; border-radius: 6px; border: 1px solid #222; }
          .timeline-orders-container { max-height: 480px; overflow-y: auto; padding-right: 10px; }

          /* Order Bento Card */
          .neo-order-bento-card { background: #111; border: 1px solid #1f1f1f; border-radius: 16px; padding: 20px; margin-bottom: 20px; transition: 0.2s; }
          .neo-order-bento-card:hover { border-color: #262626; background: #131313; }
          .order-bento-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .o-id { color: #ff5302; font-weight: 900; font-size: 14px; margin-right: 12px; }
          .o-date { color: #ffff; font-size: 12px; font-weight: 700; }
          
          .order-items-list { background: #0a0a0a; border-radius: 10px; padding: 8px 16px; margin-bottom: 15px; border: 1px solid #161616; }
          .neo-item-row { padding: 8px 0 !important; border-bottom: 1px solid #111 !important; justify-content: space-between !important; }
          .neo-item-row:last-child { border-bottom: none !important; }
          .item-left { display: flex; align-items: center; gap: 8px; }
          .arrow-bullet { color: #333; font-size: 10px; }
          .item-name { color: #eee; font-weight: 600; font-size: 13px; }
          .item-qty { color: #ffff; font-weight: 800; font-size: 11px; margin-left: 4px; }
          .item-price { color: #ffff; font-weight: 600; font-size: 12px; }

          .order-bento-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px dashed #1f1f1f; }
          .b-lbl { font-size: 10px; font-weight: 800; color: #ffff; letter-spacing: 0.5px; }
          .b-val { color: #fff; font-weight: 900; font-size: 16px; }
          .b-val small { font-size: 12px; color: #ffff; font-weight: 500; }

          /* Empty State */
          .empty-history-box { text-align: center; padding: 60px 0; color: #ffff; font-weight: 600; font-size: 13px; }
          .empty-icon { font-size: 32px; color: #222; margin-bottom: 12px; display: block; }

          /* Danger Modal */
          .modal-danger-title { color: #efffff4; font-weight: 900; }
          .btn-modal-danger-ok { background: #efffff4 !important; font-weight: 700; border-radius: 8px; }
          .btn-modal-danger-cancel { background: #161616 !important; border-color: #262626 !important; color: #ffff !important; font-weight: 700; border-radius: 8px; }

          /* Pagination styles */
          .ant-pagination-item { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; }
          .ant-pagination-item a { color: #ffff !important; font-weight: 700; }
          .ant-pagination-item-active { border-color: #ff5302 !important; }
          .ant-pagination-item-active a { color: #ff5302 !important; }
          .ant-pagination-prev .ant-pagination-item-link, .ant-pagination-next .ant-pagination-item-link { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; color: #ffff !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CustomerList;
