import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Upload, Image, Row, Col, Tag,
  Pagination, Spin, Switch, Space, Typography, ConfigProvider, Card
} from "antd";
import { 
  UploadOutlined, EditOutlined, DeleteOutlined, PlusOutlined, 
  FolderOpenOutlined, SearchOutlined, SafetyCertificateOutlined 
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getCategories1,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryApi";

const { TextArea } = Input;
const { Title, Text } = Typography;

const CategoryPage = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", image: null, status: "active",
  });
  const [allowEditSlug, setAllowEditSlug] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const slugify = (text) =>
    text.toString().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
      .replace(/[^a-z0-9\- ]/g, "").replace(/\s+/g, "-").replace(/\-+/g, "-");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories1(page, 10, search);
      setCategories(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page, search]);

  const handleShow = (item = null) => {
    setEditItem(item);
    setAllowEditSlug(false);
    if (item) {
      setFormData({ name: item.name, slug: item.slug, description: item.description, image: null, status: item.status });
    } else {
      setFormData({ name: "", slug: "", description: "", image: null, status: "active" });
    }
    setShowModal(true);
  };

  const handleNameChange = (value) => {
    const newSlug = slugify(value);
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: allowEditSlug ? prev.slug : newSlug,
    }));
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("slug", formData.slug);
    fd.append("description", formData.description);
    fd.append("status", formData.status);
    if (formData.image) fd.append("image", formData.image);

    try {
      if (editItem) {
        await updateCategory(editItem.id, fd);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(fd);
        toast.success("Thêm danh mục thành công");
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu");
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteItem.id);
      toast.success("Đã xóa danh mục");
      setShowDeleteModal(false);
      loadCategories();
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  const columns = [
    {
      title: <Text style={{ color: "#888" }}>STT</Text>,
      render: (_, __, index) => <Text style={{ color: "#555" }}>{(page - 1) * 10 + index + 1}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>ẢNH</Text>,
      dataIndex: "image",
      render: (img) => img ? (
        <Image src={`${WEB_URL}/uploads/products/${img}`} width={50} style={{ borderRadius: 8, border: "1px solid #333" }} />
      ) : <Text style={{ color: "#444" }}>—</Text>,
    },
    { 
        title: <Text style={{ color: "#888" }}>TÊN DANH MỤC</Text>, 
        dataIndex: "name",
        render: (name) => <Text style={{ color: "#fff", fontWeight: "600" }}>{name}</Text>
    },
    { title: <Text style={{ color: "#888" }}>SLUG</Text>, dataIndex: "slug", render: (s) => <Text style={{ color: "#ff6600" }}>{s}</Text> },
    {
      title: <Text style={{ color: "#888" }}>TRẠNG THÁI</Text>,
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "active" ? "#52c41a" : "#333"} style={{ color: "#000000", border: "none" }}>
          {s === "active" ? "ONLINE" : "OFFLINE"}
        </Tag>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THAO TÁC</Text>,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} ghost style={{ color: "#40a9ff", borderColor: "#40a9ff" }} onClick={() => handleShow(record)} />
          <Button danger ghost icon={<DeleteOutlined />} onClick={() => { setDeleteItem(record); setShowDeleteModal(true); }} />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: "#141414", colorText: "#fff", colorPrimary: "#ff6600", colorBorder: "#333" },
        components: {
          Table: { headerBg: "#1a1a1a", rowHoverBg: "#1f1f1f", colorText: "#fff" },
          Modal: { contentBg: "#141414", headerBg: "#141414" },
          Input: { colorBgContainer: "#0a0a0a", colorText: "#fff" },
          Select: { colorBgContainer: "#0a0a0a", colorText: "#fff" }
        }
      }}
    >
      <div style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <FolderOpenOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Cấu trúc Danh mục
            </Title>
            <Text style={{ color: "#666" }}>Phân loại hệ thống loa, amply và phụ kiện</Text>
          </Col>
          <Col>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => handleShow()} style={{ fontWeight: "bold" }}>
              THÊM PHÂN LOẠI
            </Button>
          </Col>
        </Row>

        {/* BỘ LỌC */}
        <Card style={{ marginBottom: 20, background: "#141414", border: "1px solid #222" }}>
          <Col span={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
              placeholder="Tìm kiếm danh mục..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              allowClear
              className="white-text-input"
            />
          </Col>
        </Card>

        {/* BẢNG DỮ LIỆU */}
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
          ) : (
            <>
              <Table columns={columns} dataSource={categories} rowKey="id" pagination={false} />
              <div style={{ padding: 20, display: "flex", justifyContent: "flex-end", borderTop: "1px solid #222" }}>
                <Pagination current={page} total={totalPages * 10} onChange={(p) => setPage(p)} showSizeChanger={false} />
              </div>
            </>
          )}
        </div>

        {/* MODAL THÊM/SỬA */}
        <Modal
          open={showModal}
          onCancel={() => setShowModal(false)}
          onOk={handleSubmit}
          confirmLoading={submitLoading}
          title={<span style={{ color: "#fff" }}>{editItem ? "CẬP NHẬT PHÂN LOẠI" : "TẠO DANH MỤC MỚI"}</span>}
          okText="LƯU THAY ĐỔI"
          cancelText="HỦY"
        >
          <Form layout="vertical" style={{ marginTop: 20 }}>
            <Form.Item label={<Text style={{ color: "#fff" }}>Tên danh mục</Text>}>
              <Input className="white-text-input" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="VD: Loa Karaoke" />
            </Form.Item>

            <Form.Item label={<Text style={{ color: "#fff" }}>Tùy chỉnh đường dẫn (Slug)</Text>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Switch 
                  checked={allowEditSlug} 
                  onChange={(v) => {
                    setAllowEditSlug(v);
                    if (!v) setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
                  }} 
                />
                <Input 
                  className="white-text-input"
                  value={formData.slug} 
                  readOnly={!allowEditSlug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                  style={{ color: allowEditSlug ? "#ff6600" : "#666" }}
                />
              </Space>
            </Form.Item>

            <Form.Item label={<Text style={{ color: "#fff" }}>Mô tả ngắn</Text>}>
              <TextArea
                rows={3}
                className="white-text-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả cho danh mục này..."
              />
            </Form.Item>

            <Form.Item label={<Text style={{ color: "#fff" }}>Ảnh đại diện</Text>}>
              <Upload
                beforeUpload={(file) => { setFormData({ ...formData, image: file }); return false; }}
                maxCount={1}
                listType="picture"
              >
                <Button block icon={<UploadOutlined />} style={{ background: "#0a0a0a", color: "#fff", borderColor: "#333" }}>Chọn tệp tin</Button>
              </Upload>
            </Form.Item>

            <Form.Item label={<Text style={{ color: "#fff" }}>Trạng thái hiển thị</Text>}>
              <Select value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })}>
                <Select.Option value="active">Đang hoạt động (Online)</Select.Option>
                <Select.Option value="inactive">Tạm ngừng (Offline)</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* MODAL XÓA */}
        <Modal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onOk={confirmDelete}
          okButtonProps={{ danger: true }}
          title={<span style={{ color: "#fff" }}>XÁC NHẬN GỠ BỎ</span>}
          okText="XÓA VĨNH VIỄN"
        >
          <Text style={{ color: "#fff" }}>
            Hành động này sẽ xóa danh mục <b style={{ color: "#ff6600" }}>{deleteItem?.name}</b>. 
            Mọi sản phẩm thuộc danh mục này có thể bị ảnh hưởng. Bạn chắc chắn chứ?
          </Text>
        </Modal>

        <style>{`
          .white-text-input { background: #0a0a0a !important; border-color: #333 !important; color: #fff !important; }
          .white-text-input input, .white-text-input textarea { color: #fff !important; }
          .ant-upload-list-item-name { color: #fff !important; }
          .ant-switch { background: #333; }
          .ant-switch-checked { background: #ff6600 !important; }
          .ant-pagination-item-active { border-color: #ff6600 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CategoryPage;