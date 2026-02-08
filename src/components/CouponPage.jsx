import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space, Badge,
  DatePicker, InputNumber, message, Card, Row, Col, Typography, ConfigProvider, theme
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, PercentageOutlined, CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
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
      message.error("Không thể kết nối danh sách coupon");
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
        message.success("Cập nhật mã giảm giá thành công");
      } else {
        await createCoupon(payload);
        message.success("Đã phát hành mã giảm giá mới");
      }

      setOpenModal(false);
      fetchCoupons(page, search);
    } catch (err) {
      console.error(err);
      message.error("Vui lòng kiểm tra lại thông tin biểu mẫu");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCoupon(couponToDelete.id);
      message.success("Đã hủy bỏ mã giảm giá");
      setOpenDelete(false);
      fetchCoupons(page, search);
    } catch {
      message.error("Lỗi khi xóa mã");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: <Text style={{ color: "#888" }}>MÃ VOUCHER</Text>,
      dataIndex: "code",
      render: (t) => (
        <Tag color="#1a1a1a" style={{ border: '1px dashed #ff6600', padding: '2px 10px' }}>
          <Text style={{ color: "#ff6600", fontWeight: "bold", letterSpacing: 1 }}>{t?.toUpperCase()}</Text>
        </Tag>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>GIÁ TRỊ</Text>,
      render: (r) => (
        <Text style={{ color: "#fff", fontWeight: 600 }}>
          {r.type === "percent" ? `${r.value}%` : `${Number(r.value).toLocaleString()}₫`}
        </Text>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>TỒN KHO</Text>,
      dataIndex: "quantity",
      render: (q) => <Text style={{ color: q < 10 ? "#ff4d4f" : "#fff" }}>{q} lượt</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>HẠN DÙNG</Text>,
      render: (r) => (
        <div style={{ fontSize: 12 }}>
          <Text style={{ color: "#666", display: 'block' }}>Từ: {dayjs(r.start_date).format("DD/MM/YYYY")}</Text>
          <Text style={{ color: "#aaa" }}>Đến: {dayjs(r.end_date).format("DD/MM/YYYY")}</Text>
        </div>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>TRẠNG THÁI</Text>,
      dataIndex: "status",
      render: (s) => (
        <Badge status={s === "active" ? "success" : "default"} 
          text={<Text style={{ color: s === "active" ? "#52c41a" : "#555" }}>{s === "active" ? "ĐANG CHẠY" : "DỪNG"}</Text>} 
        />
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THAO TÁC</Text>,
      align: "center",
      render: (_, r) => (
        <Space>
          <Button ghost icon={<EditOutlined />} style={{ color: '#ff6600', borderColor: '#333' }} onClick={() => openForm(r)} />
          <Button danger ghost icon={<DeleteOutlined />} onClick={() => { setCouponToDelete(r); setOpenDelete(true); }} />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorBgContainer: "#141414", colorPrimary: "#ff6600", colorBorder: "#333" }
      }}
    >
      <div style={{ padding: 24, background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <PercentageOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Chiến dịch Giảm giá
            </Title>
            <Text style={{ color: "#555" }}>Tạo và quản lý các mã ưu đãi cho khách hàng</Text>
          </Col>
          <Col>
            <Space size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
                placeholder="Tìm mã SALE..."
                className="dark-input"
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()} style={{ borderRadius: 8, height: 40 }}>
                TẠO MÃ MỚI
              </Button>
            </Space>
          </Col>
        </Row>

        {/* TABLE */}
        <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <Table
            columns={columns}
            dataSource={coupons}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              total: totalPages * 10,
              onChange: (p) => setPage(p),
            }}
          />
        </div>

        {/* DELETE MODAL */}
        <Modal
          open={openDelete}
          onCancel={() => setOpenDelete(false)}
          onOk={confirmDelete}
          title={<span style={{ color: "#fff" }}>⚠️ XÁC NHẬN XÓA</span>}
          okText="XÓA MÃ"
          okButtonProps={{ danger: true }}
        >
          <Text style={{ color: "#ccc" }}>
            Hành động này sẽ gỡ bỏ mã <b style={{ color: '#ff6600' }}>{couponToDelete?.code}</b> khỏi hệ thống. Khách hàng sẽ không thể áp dụng mã này nữa.
          </Text>
        </Modal>

        {/* ADD / EDIT MODAL */}
        <Modal
          open={openModal}
          onCancel={() => setOpenModal(false)}
          onOk={handleSave}
          width={800}
          title={<span style={{ color: "#fff" }}>{editingCoupon ? "CHỈNH SỬA CHIẾN DỊCH" : "PHÁT HÀNH MÃ MỚI"}</span>}
          okText="LƯU THAY ĐỔI"
        >
          <Form layout="vertical" form={form} style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="code" label="Mã Voucher (viết liền, không dấu)" rules={[{ required: true }]}>
                  <Input placeholder="Ví dụ: AUDIOPHILE2024" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="type" label="Loại hình giảm giá" initialValue="percent">
                  <Select dropdownStyle={{ background: '#1a1a1a' }}>
                    <Select.Option value="percent">Phần trăm (%)</Select.Option>
                    <Select.Option value="fixed">Số tiền cố định (₫)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="value" label="Giá trị giảm">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="quantity" label="Số lượng phát hành">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="min_order_value" label="Đơn hàng tối thiểu (₫)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="dateRange" label="Thời hạn hiệu lực" rules={[{ required: true }]}>
              <RangePicker 
                style={{ width: "100%" }} 
                showTime 
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} 
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="apply_to" label="Phạm vi áp dụng" initialValue="order">
                  <Select>
                    <Select.Option value="order">Toàn bộ hóa đơn</Select.Option>
                    <Select.Option value="product">Chỉ sản phẩm chỉ định</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái triển khai" initialValue="active">
                  <Select>
                    <Select.Option value="active">Kích hoạt ngay</Select.Option>
                    <Select.Option value="inactive">Tạm ngưng</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Mô tả chiến dịch">
              <Input.TextArea rows={3} placeholder="Mô tả điều kiện áp dụng cho khách hàng..." />
            </Form.Item>
          </Form>
        </Modal>

        <style>{`
          .dark-input { background: #141414 !important; border: 1px solid #333 !important; color: #fff !important; border-radius: 20px !important; width: 280px; }
          .dark-input input { color: #fff !important; }
          .ant-input-number, .ant-picker { background: #141414 !important; border: 1px solid #333 !important; }
          .ant-input-number-input, .ant-picker-input > input { color: #fff !important; }
          .ant-table-cell { border-bottom: 1px solid #1a1a1a !important; }
          .ant-modal-header { border-bottom: 1px solid #222 !important; margin-bottom: 0 !important; }
          .ant-form-item-label label { color: #888 !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CouponPage;