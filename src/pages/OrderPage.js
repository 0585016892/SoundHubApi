import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Spin,
  Typography,
  ConfigProvider,
  Row,
  Col,
  theme,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getOrders, updateOrder, deleteOrder } from "../api/orderApi";
import OrderDetailModal from "../components/OrderDetailModal";

const { Title, Text } = Typography;

const statusMap = {
  pending: {
    label: "CHỜ XỬ LÝ",
    color: "#ff5302",
    icon: <ClockCircleOutlined />,
  },
  shipping: { label: "ĐANG GIAO", color: "#3b82f6", icon: <InboxOutlined /> },
  completed: {
    color: "#22c55e",
    label: "HOÀN TẤT",
    icon: <CheckCircleOutlined />,
  },
  cancelled: {
    color: "#ef4444",
    label: "ĐÃ HỦY",
    icon: <CloseCircleOutlined />,
  },
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

  // Sửa lại bên trong OrderPage.js

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Kiểm tra nếu search rỗng thì để undefined, nếu statusFilter rỗng thì để undefined
      const searchParam = search.trim() || undefined;
      const statusParam = statusFilter || undefined;

      const res = await getOrders(page, 10, searchParam, statusParam);

      setOrders(res?.data || []);
      setTotal(res?.total || 0);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng Debounce cho ô Search để tránh gọi API liên tục khi đang gõ
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500); // Đợi người dùng ngừng gõ 500ms mới gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [page, search, statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrder(id, { order_status: status });
      toast.success("Đã cập nhật trạng thái");
      fetchOrders();
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder(orderToDelete.id);
      toast.success("Đã xóa đơn hàng");
      setOpenDelete(false);
      fetchOrders();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  // Tính toán nhanh số liệu dựa trên danh sách hiện tại để hiển thị lên Bento Stats
  const statsData = React.useMemo(() => {
    let pendingCount = 0;
    let revenue = 0;
    orders.forEach((o) => {
      if (o.order_status === "pending") pendingCount++;
      if (o.order_status === "completed")
        revenue += Number(o.final_amount || 0);
    });
    return { pendingCount, revenue };
  }, [orders]);

  const columns = [
    {
      title: "MÃ ĐƠN",
      width: 110,
      render: (_, record) => (
        <span className="order-id-badge">#DH{record.id}</span>
      ),
    },
    {
      title: "KHÁCH HÀNG",
      render: (_, record) => (
        <div className="customer-info-cell">
          <span className="cust-name">
            {(record.full_name || "Khách Vãng Lai").toUpperCase()}
          </span>
          <span className="cust-meta">
            {record.phone || record.email || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "TỔNG TIỀN",
      dataIndex: "final_amount",
      width: 160,
      render: (v) => (
        <span className="amount-cell">{Number(v || 0).toLocaleString()}đ</span>
      ),
    },
    {
      title: "TRẠNG THÁI HỆ THỐNG",
      dataIndex: "order_status",
      width: 220,
      render: (s, record) => {
        const config = statusMap[s] || { label: "TRỐNG", color: "#555" };
        if (s === "completed" || s === "cancelled") {
          return (
            <Tag
              color={config.color}
              className="status-tag-static"
              bordered={false}
            >
              {config.icon} {config.label}
            </Tag>
          );
        }
        return (
          <Select
            size="middle"
            value={s}
            bordered={false}
            className="neo-dropdown-select"
            popupClassName="neo-dropdown-popup"
            onChange={(v) => handleStatusChange(record.id, v)}
            suffixIcon={<FilterOutlined style={{ color: config.color }} />}
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                <span
                  style={{ color: val.color, fontWeight: 700, fontSize: 11 }}
                >
                  ● {val.label}
                </span>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "NGÀY KHỞI TẠO",
      dataIndex: "created_at",
      width: 180,
      render: (t) => (
        <span className="time-cell">
          {new Date(t).toLocaleString("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      title: "ĐIỀU KHIỂN",
      align: "center",
      width: 130,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="btn-action-view"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder({ id: record.id });
              setOpenDetail(true);
            }}
          />
          <Button
            type="text"
            danger
            className="btn-action-delete"
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
  if (loading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <Spin size="large" />
        <div
          style={{
            marginTop: 20,
            fontWeight: 900,
            letterSpacing: 3,
            color: "#fff",
            fontSize: 12,
          }}
        >
          ĐANG TẢI DỮ LIỆU...
        </div>
      </div>
    );
  }
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
        components: {
          Table: {
            headerBg: "#161616",
            headerColor: "#666666",
            rowHoverBg: "#1a1a1a",
          },
        },
      }}
    >
      <div className="admin-bento-layout">
        {/* HEADER & QUICK STATS BLOCK */}
        <Row gutter={[24, 24]} className="mb-4 align-items-stretch">
          <Col
            xs={24}
            xl={10}
            className="d-flex flex-column justify-content-center"
          >
            <div className="page-headline-block">
              <Title level={2} className="m-0 page-main-title">
                <ShoppingCartOutlined className="title-icon" /> Quản Lý Đơn Hàng
              </Title>
              <Text className="text-muted text-uppercase letter-spacing-1">
                Hệ thống quản trị tiến trình đơn hàng sản phẩm
              </Text>
            </div>
          </Col>

          {/* Quick Stat 1: Đơn chờ */}
          <Col xs={12} xl={7}>
            <div className="quick-stat-bento-card">
              <div className="stat-icon-box orange-glow">
                <ClockCircleOutlined />
              </div>
              <div className="stat-content">
                <span className="stat-lbl">ĐƠN ĐANG CHỜ</span>
                <span className="stat-num">
                  {statsData.pendingCount} <small>Kiện</small>
                </span>
              </div>
            </div>
          </Col>

          {/* Quick Stat 2: Doanh thu thực tế */}
          <Col xs={12} xl={7}>
            <div className="quick-stat-bento-card">
              <div className="stat-icon-box green-glow">
                <DollarOutlined />
              </div>
              <div className="stat-content">
                <span className="stat-lbl">DOANH THU THỰC TẾ</span>
                <span className="stat-num text-green">
                  {statsData.revenue.toLocaleString()} <small>đ</small>
                </span>
              </div>
            </div>
          </Col>
        </Row>

        {/* FILTER BAR ROW */}
        <div className="filter-bento-bar mb-4">
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Truy vấn tên khách hàng, email hoặc Hotline..."
                className="neo-search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                allowClear
              />
            </Col>
            <Col xs={24} md={6} className="text-end">
              <Select
                allowClear
                placeholder={
                  <span>
                    <FilterOutlined /> Lọc trạng thái
                  </span>
                }
                className="neo-filter-select"
                dropdownClassName="neo-dropdown-popup"
                onChange={(v) => {
                  setStatusFilter(v || "");
                  setPage(1);
                }}
              >
                {Object.entries(statusMap).map(([key, val]) => (
                  <Select.Option key={key} value={key}>
                    <span style={{ color: val.color }}>● {val.label}</span>
                  </Select.Option>
                ))}
              </Select>
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
            dataSource={orders}
            rowKey="id"
            loading={loading}
            className="custom-neo-table"
            pagination={{
              current: page,
              pageSize: 10,
              total,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
            }}
          />
        </motion.div>

        {/* DANGER CONFIRM MODAL */}
        <Modal
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onOk={confirmDelete}
          title={
            <span className="modal-danger-title">⚠️ HỦY LỆNH HOÀN TÁC</span>
          }
          okText="XÓA VĨNH VIỄN"
          cancelText="QUAY LẠI"
          centered
          okButtonProps={{ danger: true, className: "btn-modal-danger-ok" }}
          cancelButtonProps={{ className: "btn-modal-danger-cancel" }}
        >
          <div className="py-2">
            <Text style={{ color: "#aaa" }}>
              Hệ thống sẽ thực hiện xóa bỏ hồ sơ đơn hàng của khách hàng{" "}
              <strong style={{ color: "#ff5302" }}>
                {orderToDelete?.full_name}
              </strong>
              . Dữ liệu tài chính liên quan sẽ bị loại trừ vĩnh viễn. Bạn chắc
              chắn?
            </Text>
          </div>
        </Modal>

        <OrderDetailModal
          show={openDetail}
          handleClose={() => setOpenDetail(false)}
          orderId={selectedOrder?.id}
          statusMap={statusMap}
        />

        <style>{`
          .admin-bento-layout {
            padding: 30px;
            background: #080808;
            min-height: 100vh;
            color: #e5e5e5;
            font-family: 'Inter', sans-serif;
          }

          /* Headline block */
          .page-main-title {
            font-weight: 900 !important;
            letter-spacing: -1px;
            color: #fff !important;
            display: flex;
            align-items: center;
          }
          .title-icon { color: #ff5302; margin-right: 12px; }
          .letter-spacing-1 { letter-spacing: 1px; font-size: 11px; font-weight: 700; color: #444 !important; }

          /* Bento Quick Stats */
          .quick-stat-bento-card {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            height: 100%;
          }
          .stat-icon-box {
            width: 45px; height: 45px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; background: #161616;
          }
          .orange-glow { color: #ff5302; border: 1px solid rgba(255, 83, 2, 0.2); background: rgba(255, 83, 2, 0.05); }
          .green-glow { color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); background: rgba(34, 197, 94, 0.05); }
          .stat-content { display: flex; flex-direction: column; }
          .stat-lbl { font-size: 10px; font-weight: 700; color: #e1dfdf; letter-spacing: 0.5px; }
          .stat-num { font-size: 22px; font-weight: 900; color: #fff; line-height: 1.2; }
          .stat-num small { font-size: 12px; font-weight: 500; color: #d3d3d3; }
          .text-green { color: #22c55e !important; }

          /* Filter Bar */
          .filter-bento-bar {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 16px 20px;
          }
          .neo-search-input {
            background: #161616 !important;
            border: 1px solid #262626 !important;
            border-radius: 10px !important;
            padding: 8px 14px !important;
            color: #fff !important;
          }
          .neo-search-input .anticon { color: #ff5302 !important; }
          .neo-filter-select { width: 100%; }
          .neo-filter-select .ant-select-selector {
            background: #161616 !important;
            border: 1px solid #262626 !important;
            border-radius: 10px !important;
            height: 40px !important;
            padding: 5px 12px !important;
          }

          /* Custom Neo Table UI */
          .table-bento-container {
            background: #111;
            border: 1px solid #222;
            border-radius: 20px;
            overflow: hidden;
          }
          .custom-neo-table .ant-table { background: transparent !important; }
          .custom-neo-table .ant-table-thead > tr > th {
            font-size: 11px !important;
            font-weight: 800 !important;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #222 !important;
            padding: 18px 20px !important;
            color: #c2c2c2 !important;
          }
          .custom-neo-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #1a1a1a !important;
            padding: 16px 20px !important;
          }

          /* Cells Custom styling */
          .order-id-badge {
            background: #161616; border: 1px solid #262626;
            color: #ff5302; font-weight: 800; font-size: 12px;
            padding: 6px 12px; border-radius: 8px;
          }
          .customer-info-cell .cust-name { display: block; font-weight: 700; color: #fff; font-size: 13.5px; }
          .customer-info-cell .cust-meta { font-size: 11px; color: #555; display: block; margin-top: 2px; }
          .amount-cell { color: #ff5302; font-weight: 900; font-size: 15px; }
          .time-cell { font-size: 12px; color: #666; font-weight: 500; }

          /* Dropdown Status Selector in Row Table */
          .neo-dropdown-select {
            background: #161616; border: 1px solid #262626; border-radius: 8px;
            width: 155px; height: 32px;
          }
          .neo-dropdown-select .ant-select-selection-item {
            font-weight: 800 !important; font-size: 11px !important; text-align: center; line-height: 30px !important;
          }
          .status-tag-static {
            font-weight: 800; font-size: 10px; padding: 4px 12px; border-radius: 6px; margin: 0;
          }

          /* Popup Select Styling */
          .neo-dropdown-popup {
            background-color: #161616 !important;
            border: 1px solid #262626 !important;
            border-radius: 10px !important;
          }
          .neo-dropdown-popup .ant-select-item-option-selected { background: #222 !important; }

          /* Actions button */
          .btn-action-view { background: #161616 !important; color: #ff5302 !important; border-radius: 8px; }
          .btn-action-view:hover { background: rgba(255, 83, 2, 0.1) !important; }
          .btn-action-delete { background: #161616 !important; color: #ef4444 !important; border-radius: 8px; }
          .btn-action-delete:hover { background: rgba(239, 68, 68, 0.1) !important; }

          /* Pagination custom color overrides */
          .ant-pagination-item { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; }
          .ant-pagination-item a { color: #666 !important; font-weight: 700; }
          .ant-pagination-item-active { border-color: #ff5302 !important; }
          .ant-pagination-item-active a { color: #ff5302 !important; }
          .ant-pagination-prev .ant-pagination-item-link, .ant-pagination-next .ant-pagination-item-link {
            background: #161616 !important; border-color: #262626 !important; border-radius: 8px; color: #666 !important;
          }

          /* Antd Modal Overrides */
          .modal-danger-title { color: #ef4444; font-weight: 900; letter-spacing: 0.5px; }
          .ant-modal-content { background: #111111 !important; border: 1px solid #222 !important; border-radius: 20px !important; }
          .ant-modal-header { background: transparent !important; }
          .btn-modal-danger-ok { background: #ef4444 !important; font-weight: 700; border-radius: 8px; }
          .btn-modal-danger-cancel { background: #161616 !important; border-color: #262626 !important; color: #666 !important; font-weight: 700; border-radius: 8px; }
          
          /* Clean focus outline boxes */
          .ant-input:focus, .ant-input-focused, .ant-select:focus, .ant-select-focused {
            border-color: #ff5302 !important; box-shadow: none !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default OrderPage;
