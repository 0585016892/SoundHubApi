import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Image,
  Row,
  Col,
  Pagination,
  Spin,
  Switch,
  Space,
} from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getCategories1,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryApi";

const { TextArea } = Input;

const CategoryPage = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;

  const [categories, setCategories] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    status: "active",
  });

  const [allowEditSlug, setAllowEditSlug] = useState(false);

  // Search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Slug function
  const slugify = (text) =>
    text
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\- ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/\-+/g, "-");

  // Load categories
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

  // Open modal
  const handleShow = (item = null) => {
    setEditItem(item);
    setAllowEditSlug(false);

    if (item) {
      setFormData({
        name: item.name,
        slug: item.slug,
        description: item.description,
        image: null,
        status: item.status,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        image: null,
        status: "active",
      });
    }

    setShowModal(true);
  };

  // Auto slug
  const handleNameChange = (value) => {
    const newSlug = slugify(value);
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: allowEditSlug ? prev.slug : newSlug,
    }));
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitLoading(true);
    setOverlayLoading(true);

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
      toast.error(err.response?.data?.message || "Lỗi khi lưu danh mục");
    } finally {
      setSubmitLoading(false);
      setOverlayLoading(false);
    }
  };

  // Delete
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

  // Table columns
  const columns = [
    {
      title: "#",
      render: (_, __, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (img) =>
        img ? (
          <Image
            src={`${WEB_URL}/uploads/products/${img}`}
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          "—"
        ),
    },
    { title: "Tên danh mục", dataIndex: "name" },
    { title: "Slug", dataIndex: "slug" },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (text) => text?.slice(0, 50) + "...",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (s === "active" ? "Đang hoạt động" : "Ngừng"),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            ghost
            onClick={() => handleShow(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setDeleteItem(record);
              setShowDeleteModal(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Overlay loading */}
      {overlayLoading && (
        <div className="overlay-loading">
          <Spin size="large" />
        </div>
      )}

      <h3>📂 Quản lý danh mục</h3>

      {/* Toolbar */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShow()}>
            Thêm danh mục
          </Button>
        </Col>
        <Col span={6}>
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
          />
        </Col>
      </Row>

      {/* Table */}
      <div className="card-box">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            pagination={false}
          />
        )}
      </div>

      {/* Pagination */}
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Pagination
          current={page}
          total={totalPages * 10}
          onChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Add/Edit */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        title={editItem ? "Sửa danh mục" : "Thêm danh mục"}
      >
        <Form layout="vertical">
          <Form.Item label="Tên danh mục">
            <Input value={formData.name} onChange={(e) => handleNameChange(e.target.value)} />
          </Form.Item>

          <Form.Item label="Cho phép chỉnh slug thủ công">
            <Switch
              checked={allowEditSlug}
              onChange={(v) => {
                setAllowEditSlug(v);
                if (!v) setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
              }}
            />
          </Form.Item>

          <Form.Item label="Slug">
            <Input
              value={formData.slug}
              readOnly={!allowEditSlug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Mô tả">
            <TextArea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Ảnh danh mục">
            <Upload
              beforeUpload={(file) => {
                setFormData({ ...formData, image: file });
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Trạng thái">
            <Select
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
            >
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={confirmDelete}
        okButtonProps={{ danger: true }}
        title="Xác nhận xóa"
      >
        Bạn có chắc muốn xóa danh mục <b>{deleteItem?.name}</b> không?
      </Modal>
    </div>
  );
};

export default CategoryPage;
