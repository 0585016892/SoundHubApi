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
  message,
  Card,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../api/couponApi";

const { RangePicker } = DatePicker;

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

  /* ================= FETCH ================= */
  const fetchCoupons = async (page = 1, query = "") => {
    try {
      setLoading(true);
      const res = await getCoupons(page, 10, query);

      const now = new Date();
      const updated = res.data.map((c) => {
        const endDate = new Date(c.end_date);
        if (c.quantity <= 0 || endDate < now) return { ...c, status: "inactive" };
        return c;
      });

      setCoupons(updated);
      setPage(res.currentPage || 1);
      setTotalPages(res.totalPages || 1);
    } catch {
      message.error("Lỗi tải mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCoupons(1, search), 500);
    return () => clearTimeout(t);
  }, [search]);

  /* ================= OPEN MODAL ================= */
  const openForm = (coupon = null) => {
    setEditingCoupon(coupon);
    if (coupon) {
      form.setFieldsValue({
        ...coupon,
        dateRange: [coupon.start_date, coupon.end_date],
      });
    } else {
      form.resetFields();
    }
    setOpenModal(true);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.dateRange[0],
        end_date: values.dateRange[1],
      };
      delete payload.dateRange;

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await createCoupon(payload);
        message.success("Thêm mã thành công");
      }

      setOpenModal(false);
      fetchCoupons(page, search);
    } catch {
      message.error("Lỗi lưu dữ liệu");
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      await deleteCoupon(couponToDelete.id);
      message.success("Đã xóa mã giảm giá");
      setOpenDelete(false);
      fetchCoupons(page, search);
    } catch {
      message.error("Không thể xóa");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "#", render: (_, __, i) => (page - 1) * 10 + i + 1 },
    {
      title: "Mã",
      dataIndex: "code",
      render: (t) => <b style={{ color: "#1677ff" }}>{t}</b>,
    },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Loại",
      dataIndex: "type",
      render: (t) => (t === "percent" ? "Phần trăm (%)" : "Giá trị (₫)"),
    },
    {
      title: "Giá trị",
      render: (r) =>
        r.type === "percent" ? `${r.value}%` : `${Number(r.value).toLocaleString()} ₫`,
    },
    {
      title: "Áp dụng",
      dataIndex: "apply_to",
      render: (t) => (t === "order" ? "Hóa đơn" : "Sản phẩm"),
    },
    { title: "Số lượng", dataIndex: "quantity" },
    {
      title: "Đơn tối thiểu",
      dataIndex: "min_order_value",
      render: (v) => Number(v).toLocaleString() + " ₫",
    },
    {
      title: "Thời gian",
      render: (r) =>
        `${new Date(r.start_date).toLocaleDateString()} - ${new Date(
          r.end_date
        ).toLocaleDateString()}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) =>
        s === "active" ? <Tag color="green">Hoạt động</Tag> : <Tag>Ngừng</Tag>,
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openForm(r)} />
          <Button
            danger
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
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>🎟️ Quản lý mã giảm giá</h2>
        </Col>
        <Col>
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm mã hoặc mô tả..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
              Thêm mã
            </Button>
          </Space>
        </Col>
      </Row>

      {/* TABLE */}
      <Card>
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total: totalPages * 10,
            onChange: (p) => fetchCoupons(p, search),
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
        title="Xác nhận xóa mã giảm giá"
      >
        ⚠️ Hành động này không thể hoàn tác
      </Modal>

      {/* ADD / EDIT MODAL */}
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSave}
        width={900}
        title={editingCoupon ? "✏️ Sửa mã giảm giá" : "➕ Thêm mã giảm giá"}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true }]}>
                <Input placeholder="SALE10" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="type" label="Loại" initialValue="percent">
                <Select>
                  <Select.Option value="percent">Phần trăm (%)</Select.Option>
                  <Select.Option value="fixed">Giá trị cố định</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="value" label="Giá trị giảm">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="Số lượng">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="min_order_value" label="Đơn tối thiểu">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dateRange" label="Thời gian áp dụng">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="apply_to" label="Áp dụng" initialValue="order">
                <Select>
                  <Select.Option value="order">Toàn bộ đơn</Select.Option>
                  <Select.Option value="product">Theo sản phẩm</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="active">
                <Select>
                  <Select.Option value="active">Hoạt động</Select.Option>
                  <Select.Option value="inactive">Ngừng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponPage;
