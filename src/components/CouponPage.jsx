import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  DatePicker,
  InputNumber,
  Typography,
  ConfigProvider,
  Row,
  Col,
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PercentageOutlined,
  CalendarOutlined,
  InboxOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../api/couponApi";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= FETCH DATA ================= */
  const fetchCoupons = async (p = 1, query = "") => {
    try {
      setLoading(true);
      const res = await getCoupons(p, 10, query);
      const now = dayjs();

      const updated = (res.data || []).map((c) => {
        const isExpired = dayjs(c.end_date).isBefore(now);
        if (c.quantity <= 0 || isExpired) return { ...c, status: "inactive" };
        return c;
      });

      setCoupons(updated);
      setPage(res.currentPage || 1);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Không thể kết nối danh sách coupon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(page, search);
  }, [page, search]);

  /* ================= FORM HANDLERS ================= */
  const openForm = (coupon = null) => {
    setEditingCoupon(coupon);
    if (coupon) {
      form.setFieldsValue({
        ...coupon,
        dateRange: [dayjs(coupon.start_date), dayjs(coupon.end_date)],
      });
    } else {
      form.resetFields();
    }
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.dateRange[0].format("YYYY-MM-DD HH:mm:ss"),
        end_date: values.dateRange[1].format("YYYY-MM-DD HH:mm:ss"),
      };
      delete payload.dateRange;

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await createCoupon(payload);
        toast.success("Đã phát hành mã giảm giá mới");
      }

      setOpenModal(false);
      fetchCoupons(page, search);
    } catch (err) {
      console.error(err);
      toast.error("Vui lòng kiểm tra lại thông tin biểu mẫu");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCoupon(couponToDelete.id);
      toast.success("Đã hủy bỏ mã giảm giá");
      setOpenDelete(false);
      fetchCoupons(page, search);
    } catch {
      toast.error("Lỗi khi xóa mã");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "MÃ VOUCHER",
      dataIndex: "code",
      render: (t) => (
        <span className="coupon-code-badge">{t?.toUpperCase()}</span>
      ),
    },
    {
      title: "MỨC ƯU ĐÃI",
      render: (r) => (
        <span className="benefit-cell">
          {r.type === "percent"
            ? `${r.value}%`
            : `${Number(r.value).toLocaleString()}đ`}
        </span>
      ),
    },
    {
      title: "LƯỢT KHẢ DỤNG",
      dataIndex: "quantity",
      render: (q) => (
        <span className={`stock-cell ${q < 10 ? "critical" : ""}`}>
          <InboxOutlined /> {q} lượt
        </span>
      ),
    },
    {
      title: "CHU KỲ HIỆU LỰC",
      render: (r) => (
        <div className="duration-cell">
          <span>
            <CalendarOutlined /> {dayjs(r.start_date).format("DD/MM/YYYY")}
          </span>
          <span className="arrow-split">→</span>
          <span className="end-txt">
            {dayjs(r.end_date).format("DD/MM/YYYY")}
          </span>
        </div>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      render: (s) => (
        <span
          className={`status-pill ${s === "active" ? "active" : "inactive"}`}
        >
          ● {s === "active" ? "ĐANG CHẠY" : "HẾT HẠN / DỪNG"}
        </span>
      ),
    },
    {
      title: "BẢNG ĐIỀU KHIỂN",
      align: "center",
      width: 140,
      render: (_, r) => (
        <Space size="middle">
          <Button
            type="text"
            className="btn-action-view"
            icon={<EditOutlined />}
            onClick={() => openForm(r)}
          />
          <Button
            type="text"
            danger
            className="btn-action-delete"
            icon={<DeleteOutlined />}
            onClick={() => {
              setCouponToDelete(r);
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
        {/* HEADER & CONTROLS BAR */}
        <div className="filter-bento-bar mb-4">
          <Row gutter={[24, 16]} justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <div className="page-headline-block">
                <Title level={2} className="m-0 page-main-title">
                  <PercentageOutlined className="title-icon" /> Quản Lý Mã Giảm
                  Giá
                </Title>
                <Text className="text-muted letter-spacing-1">
                  Phát hành cấu trúc khuyến mãi, cấu hình phân tích giới hạn
                  chiết khấu đơn hàng
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12} className="text-end">
              <Space size="middle" className="mobile-full-width-space">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tra cứu token mã chiến dịch..."
                  className="neo-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openForm()}
                  className="btn-neo-primary"
                >
                  TẠO MÃ MỚI
                </Button>
              </Space>
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
            dataSource={coupons}
            rowKey="id"
            loading={loading}
            className="custom-neo-table"
            pagination={{
              current: page,
              total: totalPages * 10,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
            }}
          />
        </motion.div>

        {/* DANGER DELETION MODAL */}
        <Modal
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onOk={confirmDelete}
          title={
            <span className="modal-danger-title">⚠️ ĐÌNH CHỈ CHIẾN DỊCH</span>
          }
          okText="HỦY BỎ VĨNH VIỄN"
          cancelText="QUAY LẠI"
          centered
          okButtonProps={{ danger: true, className: "btn-modal-danger-ok" }}
          cancelButtonProps={{ className: "btn-modal-danger-cancel" }}
        >
          <div className="py-2">
            <Text style={{ color: "#fff" }}>
              Hệ thống sẽ thực hiện vô hiệu hóa token ưu đãi{" "}
              <strong style={{ color: "#ff5302" }}>
                {couponToDelete?.code}
              </strong>
              . Mọi giỏ hàng hiện tại đang áp dụng mã sẽ bị hủy tính năng giảm
              giá. Bạn chắc chắn?
            </Text>
          </div>
        </Modal>

        {/* MODERN FORM MODAL */}
        <Modal
          open={openModal}
          onCancel={() => setOpenModal(false)}
          onOk={handleSave}
          width={850}
          centered
          className="neo-form-modal"
          title={
            <div className="form-modal-header-title">
              {editingCoupon
                ? "Chỉnh sửa cấu hình voucher"
                : "Phát hành mã ưu đãi hệ thống"}
            </div>
          }
          okText={editingCoupon ? "LƯU CẬP NHẬT" : "KHỞI CHẠY CHIẾN DỊCH"}
          cancelText="HỦY LỆNH"
        >
          <Form layout="vertical" form={form} className="neo-form-container">
            <div className="form-sub-section-title">
              <FireOutlined /> THÔNG TIN CỐT LÕI
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="Mã Token Voucher (Viết liền, in hoa)"
                  rules={[
                    { required: true, message: "Vui lòng điền mã token" },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: QUY2_CHILL_2026"
                    className="neo-form-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Cơ chế chiết khấu"
                  initialValue="percent"
                >
                  <Select
                    popupClassName="neo-select-dropdown"
                    className="neo-form-select"
                  >
                    <Select.Option value="percent">
                      Tỉ lệ phần trăm (%)
                    </Select.Option>
                    <Select.Option value="fixed">
                      Khấu trừ tiền mặt trực tiếp (đ)
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="form-sub-section-title">
              <DollarOutlined /> ĐỊNH LƯỢNG GIÁ TRỊ TÀI CHÍNH
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="value"
                  label="Biên độ giảm"
                  rules={[{ required: true, message: "Nhập giá trị" }]}
                >
                  <InputNumber
                    min={1}
                    className="neo-form-input-number"
                    placeholder="Mức giảm..."
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Tổng số lượng cấp phát"
                  rules={[{ required: true, message: "Nhập số lượng" }]}
                >
                  <InputNumber
                    min={1}
                    className="neo-form-input-number"
                    placeholder="Lượt dùng..."
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="min_order_value"
                  label="Sàn đơn hàng tối thiểu"
                >
                  <InputNumber
                    min={0}
                    className="neo-form-input-number"
                    placeholder="Giá trị kích hoạt (đ)..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="form-sub-section-title">
              <CalendarOutlined /> THỜI HẠN & PHẠM VI HỆ THỐNG
            </div>
            <Form.Item
              name="dateRange"
              label="Thời gian chiến dịch hoạt động"
              rules={[{ required: true, message: "Vui lòng chọn thời hạn" }]}
            >
              <RangePicker
                style={{ width: "100%" }}
                showTime
                placeholder={[
                  "Thời điểm bắt đầu kích hoạt",
                  "Thời điểm tự động đóng mã",
                ]}
                className="neo-form-range-picker"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="apply_to"
                  label="Phạm vi áp dụng mục tiêu"
                  initialValue="order"
                >
                  <Select
                    popupClassName="neo-select-dropdown"
                    className="neo-form-select"
                  >
                    <Select.Option value="order">
                      Toàn bộ giỏ hàng hóa đơn
                    </Select.Option>
                    <Select.Option value="product">
                      Giới hạn nhóm sản phẩm chỉ định
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái phân phối"
                  initialValue="active"
                >
                  <Select
                    popupClassName="neo-select-dropdown"
                    className="neo-form-select"
                  >
                    <Select.Option value="active">
                      Kích hoạt phân phối ngay
                    </Select.Option>
                    <Select.Option value="inactive">
                      Tạm giữ cấu hình trong kho
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="form-sub-section-title">
              <InfoCircleOutlined /> DIỄN GIẢI CHÍNH SÁCH
            </div>
            <Form.Item
              name="description"
              label="Ghi chú điều kiện / Nội dung hiển thị khách hàng"
            >
              <Input.TextArea
                rows={3}
                placeholder="Ví dụ: Chỉ áp dụng cho các dòng thiết bị âm thanh Audiophile cao cấp, không tính hàng cũ..."
                className="neo-form-textarea"
              />
            </Form.Item>
          </Form>
        </Modal>

        <style>{`
          .admin-bento-layout { padding: 30px; background: #080808; min-height: 100vh; color: #e5e5e5; font-family: 'Inter', sans-serif; }
          .page-main-title { font-weight: 900 !important; letter-spacing: -1px; color: #fff !important; display: flex; align-items: center; }
          .title-icon { color: #ff5302; margin-right: 12px; }
          .letter-spacing-1 { letter-spacing: 0.5px; font-size: 11px; font-weight: 700; color: #ffff !important; display: block; margin-top: 4px; }

          /* Filter Bar */
          .filter-bento-bar { background: #111; border: 1px solid #222; border-radius: 16px; padding: 20px; }
          .neo-search-input { background: #161616 !important; border: 1px solid #262626 !important; border-radius: 10px !important; padding: 10px 14px !important; color: #fff !important; width: 280px; }
          .neo-search-input .anticon { color: #ff5302 !important; }
          .btn-neo-primary { background: #ff5302 !important; border: none !important; font-weight: 800 !important; border-radius: 10px !important; height: 44px !important; padding: 0 20px !important; letter-spacing: 0.5px; }
          .btn-neo-primary:hover { background: #ff661d !important; }

          /* Table Layout */
          .table-bento-container { background: #111; border: 1px solid #222; border-radius: 20px; overflow: hidden; }
          .custom-neo-table .ant-table { background: transparent !important; }
          .custom-neo-table .ant-table-thead > tr > th { font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.5px; border-bottom: 1px solid #222 !important; padding: 18px 20px !important; color: #ffff !important; background: #161616 !important; }
          .custom-neo-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1a1a1a !important; padding: 16px 20px !important; }

          /* Cells design */
          .coupon-code-badge { background: #161616; border: 1px dashed #ff5302; color: #ff5302; font-weight: 900; font-size: 12px; letter-spacing: 1px; padding: 6px 14px; border-radius: 8px; display: inline-block; }
          .benefit-cell { color: #fff; font-weight: 800; font-size: 15px; }
          .stock-cell { color: #fff; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px; }
          .stock-cell.critical { color: #efffff4; }
          .duration-cell { font-size: 12px; color: #ffff; font-weight: 600; display: flex; align-items: center; gap: 8px; }
          .duration-cell .end-txt { color: #fff; }
          .duration-cell .arrow-split { color: #333; font-weight: 900; }
          .status-pill { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
          .status-pill.active { color: #22c55e; background: rgba(34, 197, 94, 0.05); }
          .status-pill.inactive { color: #ffff; background: rgba(255, 255, 255, 0.02); }

          /* Action Buttons */
          .btn-action-view { background: #161616 !important; color: #ff5302 !important; border-radius: 8px; }
          .btn-action-view:hover { background: rgba(255, 83, 2, 0.1) !important; }
          .btn-action-delete { background: #161616 !important; color: #efffff4 !important; border-radius: 8px; }
          .btn-action-delete:hover { background: rgba(239, 68, 68, 0.1) !important; }

          /* Form Modal Styling */
          .neo-form-modal .ant-modal-content { background: #0e0e0e !important; border: 1px solid #222 !important; border-radius: 24px !important; padding: 30px !important; }
          .form-modal-header-title { color: #fff; font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; }
          .neo-form-container { margin-top: 25px; }
          .form-sub-section-title { font-size: 10px; font-weight: 900; color: #ffff; letter-spacing: 1px; margin: 20px 0 12px; display: flex; align-items: center; gap: 6px; }
          .form-sub-section-title:first-of-type { margin-top: 0; }
          
          /* Form Controls Override */
          .ant-form-item { margin-bottom: 16px !important; }
          .ant-form-item-label label { color: #ffff !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase; }
          .neo-form-input, .neo-form-select .ant-select-selector, .neo-form-input-number, .neo-form-range-picker, .neo-form-textarea { background: #141414 !important; border: 1px solid #222 !important; border-radius: 10px !important; color: #fff !important; width: 100% !important; padding: 8px 12px !important; }
          .neo-form-select .ant-select-selector, .neo-form-range-picker { padding: 4px 12px !important; height: 42px !important; }
          .neo-form-input-number { padding: 4px 4px !important; }
          .neo-form-textarea { padding: 12px !important; }
          
          /* Input Text color forced inside antd internal classes */
          .ant-input-number-input, .ant-picker-input > input, .ant-select-selection-item { color: #fff !important; font-weight: 600; }
          .ant-input::placeholder, .ant-input-number-input::placeholder { color: #ffff !important; }

          /* Select Dropdown */
          .neo-select-dropdown { background: #141414 !important; border: 1px solid #222 !important; border-radius: 10px !important; padding: 6px !important; }
          .neo-select-dropdown .ant-select-item { color: #fff !important; font-weight: 600; border-radius: 6px; }
          .neo-select-dropdown .ant-select-item-option-selected { background: #222 !important; color: #fff !important; }

          /* Danger Modal */
          .modal-danger-title { color: #efffff4; font-weight: 900; }
          .btn-modal-danger-ok { background: #efffff4 !important; font-weight: 700; border-radius: 8px; }
          .btn-modal-danger-cancel { background: #161616 !important; border-color: #262626 !important; color: #ffff !important; font-weight: 700; border-radius: 8px; }

          /* Pagination custom */
          .ant-pagination-item { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; }
          .ant-pagination-item a { color: #ffff !important; font-weight: 700; }
          .ant-pagination-item-active { border-color: #ff5302 !important; }
          .ant-pagination-item-active a { color: #ff5302 !important; }
          .ant-pagination-prev .ant-pagination-item-link, .ant-pagination-next .ant-pagination-item-link { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; color: #ffff !important; }

          /* Glow focus */
          .ant-input:focus, .ant-input-focused, .ant-select:focus, .ant-select-focused, .ant-input-number:focus, .ant-input-number-focused, .ant-picker:focus, .ant-picker-focused { border-color: #ff5302 !important; box-shadow: none !important; }

          @media (max-width: 768px) {
            .neo-search-input { width: 100%; }
            .mobile-full-width-space { width: 100%; justify-content: space-between; }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CouponPage;
