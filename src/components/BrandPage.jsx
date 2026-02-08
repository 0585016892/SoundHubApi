import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Upload, Select, Tag, Space,
  Image, Spin, Pagination, Typography, Row, Col, ConfigProvider, Card
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  SearchOutlined, GlobalOutlined, RocketOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getBrands1,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../api/brandApi";

const { Title, Text } = Typography;

const BrandPage = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const slugify = (text) =>
    text.toString().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
      .replace(/[^a-z0-9\- ]/g, "").replace(/\s+/g, "-").replace(/\-+/g, "-");

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands1(page, limit, search);
      setBrands(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Lỗi tải thương hiệu");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, [page, search]);

  const openAdd = () => {
    setEditBrand(null);
    form.resetFields();
    setOpenModal(true);
  };

  const openEdit = (brand) => {
    setEditBrand(brand);
    form.setFieldsValue({
      name: brand.name,
      slug: brand.slug,
      origin: brand.origin,
      description: brand.description,
      status: brand.status,
    });
    setOpenModal(true);
  };

  const onFinish = async (values) => {
    const fd = new FormData();
    Object.keys(values).forEach((key) => {
      if (key !== "logo") fd.append(key, values[key] || "");
    });
    if (values.logo?.file) fd.append("logo", values.logo.file);

    try {
      if (editBrand) {
        await updateBrand(editBrand.id, fd);
        toast.success("Cập nhật thành công");
      } else {
        await createBrand(fd);
        toast.success("Thêm thương hiệu mới thành công");
      }
      setOpenModal(false);
      loadBrands();
    } catch {
      toast.error("Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = (brand) => {
    Modal.confirm({
      title: <span style={{ color: '#fff' }}>Xác nhận xóa thương hiệu?</span>,
      content: <span style={{ color: '#ccc' }}>Bạn chắc chắn muốn xóa {brand.name}? Dữ liệu không thể khôi phục.</span>,
      okText: "Xóa ngay",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await deleteBrand(brand.id);
          toast.success("Đã xóa");
          loadBrands();
        } catch { toast.error("Lỗi khi xóa"); }
      },
    });
  };

  const columns = [
    {
      title: <Text style={{ color: "#888" }}>ID</Text>,
      render: (_, __, i) => <Text style={{ color: "#555" }}>{(page - 1) * limit + i + 1}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>LOGO</Text>,
      dataIndex: "logo",
      render: (logo) => (
        <Image
          width={60}
          height={40}
          src={`${WEB_URL}/uploads/products/${logo}`}
          style={{ borderRadius: 6, border: '1px solid #333', objectFit: 'contain', background: '#fff', padding: '2px' }}
        />
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THƯƠNG HIỆU</Text>,
      dataIndex: "name",
      render: (t) => <Text style={{ color: "#fff", fontWeight: "700", fontSize: '15px' }}>{t.toUpperCase()}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>XUẤT XỨ</Text>,
      dataIndex: "origin",
      render: (o) => <Tag icon={<GlobalOutlined />} color="#333" style={{ color: '#000000', border: 'none' }}>{o || 'N/A'}</Tag>
    },
    {
      title: <Text style={{ color: "#888" }}>MÔ TẢ</Text>,
      dataIndex: "description",
      render: (d) => <Text style={{ color: "#aaa" }}>{d?.length > 40 ? d.slice(0, 40) + "..." : d}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>TRẠNG THÁI</Text>,
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "active" ? "#52c41a" : "#444"} style={{ color: "#000000", borderRadius: 4 }}>
          {s === "active" ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>HÀNH ĐỘNG</Text>,
      render: (_, record) => (
        <Space>
          <Button ghost icon={<EditOutlined />} style={{ color: '#40a9ff', borderColor: '#40a9ff' }} onClick={() => openEdit(record)} />
          <Button danger ghost icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: "#141414", colorText: "#ffffff", colorPrimary: "#ff6600", colorBorder: "#333" },
        components: {
          Table: { headerBg: "#1a1a1a", rowHoverBg: "#1f1f1f" },
          Modal: { contentBg: "#141414", headerBg: "#141414" },
          Input: { colorBgContainer: "#0a0a0a", colorText: "#fff" },
          Select: { colorBgContainer: "#0a0a0a", colorText: "#fff" }
        }
      }}
    >
      <div style={{ padding: "24px", background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <RocketOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Hệ thống Thương hiệu
            </Title>
            <Text style={{ color: "#666" }}>Quản lý các đối tác sản xuất thiết bị âm thanh</Text>
          </Col>
          <Col>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd} style={{ fontWeight: "bold" }}>
              TẠO THƯƠNG HIỆU
            </Button>
          </Col>
        </Row>

        {/* SEARCH BAR */}
        <Card style={{ marginBottom: 20, background: "#141414", border: "1px solid #222" }}>
          <Col span={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
              placeholder="Tìm tên đối tác hoặc xuất xứ..."
              allowClear
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="white-text-input"
            />
          </Col>
        </Card>

        {/* TABLE DỮ LIỆU */}
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <Table
            columns={columns}
            dataSource={brands}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
          <div style={{ padding: 20, display: "flex", justifyContent: "flex-end", borderTop: "1px solid #222" }}>
            <Pagination
              current={page}
              total={totalPages * limit}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        </div>

        {/* MODAL FORM */}
        <Modal
          open={openModal}
          onCancel={() => setOpenModal(false)}
          title={<span style={{ color: "#fff" }}>{editBrand ? "CẬP NHẬT ĐỐI TÁC" : "THÊM ĐỐI TÁC MỚI"}</span>}
          onOk={() => form.submit()}
          okText="LƯU THÔNG TIN"
          cancelText="HỦY"
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label={<Text style={{ color: "#fff" }}>Tên thương hiệu</Text>} rules={[{ required: true }]}>
                  <Input 
                    placeholder="VD: Sony, JBL..."
                    className="white-text-input"
                    onChange={(e) => form.setFieldsValue({ slug: slugify(e.target.value) })}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="origin" label={<Text style={{ color: "#fff" }}>Xuất xứ (Quốc gia)</Text>}>
                  <Input placeholder="VD: USA, Japan..." className="white-text-input" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="slug" label={<Text style={{ color: "#fff" }}>Đường dẫn (Slug)</Text>}>
              <Input className="white-text-input" style={{ color: '#ff6600' }} />
            </Form.Item>

            <Form.Item name="description" label={<Text style={{ color: "#fff" }}>Giới thiệu thương hiệu</Text>}>
              <Input.TextArea rows={3} className="white-text-input" placeholder="Thông tin tóm tắt về hãng..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label={<Text style={{ color: "#fff" }}>Trạng thái hợp tác</Text>} initialValue="active">
                  <Select>
                    <Select.Option value="active">Đang kinh doanh</Select.Option>
                    <Select.Option value="inactive">Ngừng kinh doanh</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="logo" label={<Text style={{ color: "#fff" }}>Logo thương hiệu</Text>}>
                  <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
                    <Button block icon={<UploadOutlined />} style={{ background: '#0a0a0a', color: '#fff', borderColor: '#333' }}>Tải Logo</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <style>{`
          .white-text-input { background: #0a0a0a !important; border-color: #333 !important; color: #fff !important; }
          .white-text-input input, .white-text-input textarea { color: #fff !important; }
          .ant-pagination-item-active { border-color: #ff6600 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }
          .ant-table-placeholder .ant-empty-description { color: #666; }
          .ant-upload-list-item-name { color: #fff !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default BrandPage;