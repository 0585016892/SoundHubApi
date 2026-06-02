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
  Tag,
  Pagination,
  Spin,
  Switch,
  Space,
  Typography,
  ConfigProvider,
  theme,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  LinkOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
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
    name: "",
    slug: "",
    description: "",
    image: null,
    status: "active",
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
    text
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\- ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/\-+/g, "-");

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
      title: "INDEX",
      width: 80,
      render: (_, __, i) => (
        <span className="index-cell">#{(page - 1) * 10 + i + 1}</span>
      ),
    },
    {
      title: "HÌNH ẢNH",
      dataIndex: "image",
      width: 120,
      render: (img) => (
        <div className="category-img-frame">
          <Image
            src={
              img ? `${WEB_URL}/uploads/products/${img}` : "/placeholder.png"
            }
            width={60}
            height={60}
            preview={{
              mask: (
                <div className="custom-preview-mask">
                  <EyeOutlined />
                </div>
              ),
            }}
          />
        </div>
      ),
    },
    {
      title: "TÊN DANH MỤC",
      dataIndex: "name",
      render: (name) => (
        <span className="category-name-txt">{name?.toUpperCase()}</span>
      ),
    },
    {
      title: "URL SLUG",
      dataIndex: "slug",
      render: (s) => (
        <span className="slug-txt">
          <LinkOutlined /> {s}
        </span>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      width: 150,
      render: (s) => (
        <span
          className={`status-pill ${s === "active" ? "active" : "inactive"}`}
        >
          ● {s === "active" ? "ONLINE" : "OFFLINE"}
        </span>
      ),
    },
    {
      title: "QUẢN TRỊ",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="btn-action-edit"
            icon={<EditOutlined />}
            onClick={() => handleShow(record)}
          />
          <Button
            type="text"
            danger
            className="btn-action-delete"
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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "#111111",
          colorText: "#ffffff",
          colorPrimary: "#ff6600",
          colorBorder: "#222222",
        },
      }}
    >
      <div className="admin-bento-layout">
        {/* TOP BAR: HEADER & SEARCH */}
        <div className="filter-bento-bar mb-4">
          <Row gutter={[24, 16]} justify="space-between" align="middle">
            <Col xs={24} md={14}>
              <div className="page-headline-block">
                <Title level={2} className="m-0 page-main-title">
                  <FolderOpenOutlined className="title-icon" /> Quản lý danh mục
                </Title>
                <Text className="text-muted letter-spacing-1">
                  Phân cấp hệ thống dữ liệu, quản lý luồng danh mục và cấu trúc
                  hiển thị website
                </Text>
              </div>
            </Col>
            <Col xs={24} md={10} className="text-end">
              <Space size="middle" className="mobile-full-width">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tìm kiếm phân loại..."
                  className="neo-search-input"
                  value={search}
                  allowClear
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleShow()}
                  className="btn-neo-primary"
                >
                  TẠO MỚI
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* DATA GRID BENTO */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="table-bento-container"
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 100 }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                pagination={false}
                className="custom-neo-table"
              />
              <div className="neo-pagination-wrapper">
                <Pagination
                  current={page}
                  total={totalPages * 10}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </motion.div>

        {/* MODAL EDIT/ADD */}
        <Modal
          open={showModal}
          onCancel={() => setShowModal(false)}
          onOk={handleSubmit}
          confirmLoading={submitLoading}
          title={
            <div className="form-modal-header-title">
              {editItem ? "HIỆU CHỈNH DANH MỤC" : "KHỞI TẠO CẤU TRÚC MỚI"}
            </div>
          }
          okText={editItem ? "CẬP NHẬT" : "PHÁT HÀNH"}
          cancelText="HỦY BỎ"
          width={650}
          centered
          className="neo-form-modal"
        >
          <Form layout="vertical" className="neo-form-container">
            <div className="form-sub-section-title">
              <ControlOutlined /> THÔNG TIN CƠ BẢN
            </div>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="TÊN DANH MỤC PHÂN LOẠI">
                  <Input
                    className="neo-form-input"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="VD: LOA KARAOKE HI-END"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="CẤU HÌNH ĐƯỜNG DẪN (SLUG)">
              <div className="slug-config-box">
                <div className="slug-switch-area">
                  <Text style={{ color: "#666", fontSize: 11 }}>
                    CHẾ ĐỘ TỰ CHỈNH
                  </Text>
                  <Switch
                    checked={allowEditSlug}
                    size="small"
                    onChange={(v) => {
                      setAllowEditSlug(v);
                      if (!v)
                        setFormData((prev) => ({
                          ...prev,
                          slug: slugify(prev.name),
                        }));
                    }}
                  />
                </div>
                <Input
                  prefix={<LinkOutlined />}
                  className={`neo-form-input ${allowEditSlug ? "slug-active" : "slug-readonly"}`}
                  value={formData.slug}
                  readOnly={!allowEditSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
            </Form.Item>

            <div className="form-sub-section-title">
              <InfoCircleOutlined /> CHI TIẾT & HIỂN THỊ
            </div>
            <Form.Item label="MÔ TẢ NGẮN (DESCRIPTION)">
              <TextArea
                rows={3}
                className="neo-form-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả đặc tính của nhóm sản phẩm này..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="TRẠNG THÁI">
                  <Select
                    popupClassName="neo-select-dropdown"
                    className="neo-form-select"
                    value={formData.status}
                    onChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <Select.Option value="active">
                      ĐANG HOẠT ĐỘNG (ONLINE)
                    </Select.Option>
                    <Select.Option value="inactive">
                      TẠM ẨN (OFFLINE)
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ẢNH ĐẠI DIỆN">
                  <Upload
                    beforeUpload={(file) => {
                      setFormData({ ...formData, image: file });
                      return false;
                    }}
                    maxCount={1}
                    listType="picture"
                  >
                    <Button
                      block
                      icon={<UploadOutlined />}
                      className="btn-neo-uploader"
                    >
                      CHỌN TẬP TIN
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* MODAL DELETE */}
        <Modal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onOk={confirmDelete}
          okButtonProps={{ danger: true, className: "btn-modal-danger-ok" }}
          cancelButtonProps={{ className: "btn-modal-danger-cancel" }}
          title={
            <span className="modal-danger-title">
              ⚠️ XÁC NHẬN GỠ BỎ HỆ THỐNG
            </span>
          }
          okText="XÓA VĨNH VIỄN"
          centered
        >
          <div style={{ padding: "10px 0" }}>
            <Text style={{ color: "#aaa" }}>Hệ thống sẽ loại bỏ danh mục:</Text>
            <div
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: 16,
                marginTop: 5,
              }}
            >
              {deleteItem?.name?.toUpperCase()}
            </div>
            <Text
              style={{
                color: "#ef4444",
                fontSize: 12,
                display: "block",
                marginTop: 10,
              }}
            >
              * Lưu ý: Các sản phẩm liên kết sẽ bị mất phân loại gốc.
            </Text>
          </div>
        </Modal>

        <style>{`
          .admin-bento-layout { padding: 30px; background: #080808; min-height: 100vh; color: #ffffff; font-family: 'Inter', sans-serif; }
          .page-main-title { font-weight: 900 !important; letter-spacing: -1px; color: #ffffff !important; display: flex; align-items: center; }
          .title-icon { color: #ff6600; margin-right: 12px; }
          .letter-spacing-1 { letter-spacing: 0.5px; font-size: 11px; font-weight: 700; color: #444 !important; display: block; margin-top: 4px; text-transform: uppercase; }

          .filter-bento-bar { background: #111111; border: 1px solid #222222; border-radius: 16px; padding: 20px; }
          .neo-search-input { background: #161616 !important; border: 1px solid #262626 !important; border-radius: 10px !important; padding: 10px 14px !important; color: #ffffff !important; width: 280px; }
          .btn-neo-primary { background: #ff6600 !important; border: none !important; font-weight: 800 !important; border-radius: 10px !important; height: 44px !important; padding: 0 25px !important; }

          .table-bento-container { background: #111111; border: 1px solid #222222; border-radius: 20px; overflow: hidden; }
          .custom-neo-table .ant-table { background: transparent !important; }
          .custom-neo-table .ant-table-thead > tr > th { font-size: 11px !important; font-weight: 800 !important; background: #161616 !important; color: #d2d2d2 !important; border-bottom: 1px solid #222222 !important; padding: 18px 20px !important; letter-spacing: 0.5px; }
          .custom-neo-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1a1a1a !important; padding: 16px 20px !important;color: #d2d2d2  }
          
          .index-cell { font-family: 'Mono', monospace; color: #444; font-weight: 700; }
          .category-name-txt { color: #ffffff !important; font-weight: 800; font-size: 14px; }
          .slug-txt { color: #ff6600 !important; font-size: 12px; font-family: 'Mono', monospace; opacity: 0.8; }
          
          .category-img-frame { background: #1a1a1a; border: 1px solid #333; border-radius: 10px; overflow: hidden; width: 62px; height: 62px; display: flex; align-items: center; justify-content: center; }
          .custom-preview-mask { background: rgba(255, 102, 0, 0.8); font-size: 18px; color: #fff; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

          .status-pill { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
          .status-pill.active { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
          .status-pill.inactive { color: #666; background: rgba(255, 255, 255, 0.05); }

          .btn-action-edit { background: #161616 !important; color: #40a9ff !important; border-radius: 8px; }
          .btn-action-delete { background: #161616 !important; color: #ef4444 !important; border-radius: 8px; }
          
          .neo-pagination-wrapper { padding: 18px 20px; display: flex; justify-content: flex-end; border-top: 1px solid #1a1a1a; }

          .neo-form-modal .ant-modal-content { background: #0e0e0e !important; border: 1px solid #222222 !important; border-radius: 24px !important; padding: 30px !important; }
          .form-modal-header-title { color: #ffffff !important; font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; }
          .form-sub-section-title { font-size: 10px; font-weight: 900; color: #444; letter-spacing: 1px; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px; }
          
          .ant-form-item-label label { color: #ececec !important; font-size: 10px !important; font-weight: 800 !important; text-transform: uppercase; }
          .neo-form-input, .neo-form-select .ant-select-selector, .neo-form-textarea, .btn-neo-uploader { background: #141414 !important; border: 1px solid #222222 !important; border-radius: 10px !important; color: #ffffff !important; }
          .neo-form-select .ant-select-selector { height: 42px !important; display: flex; align-items: center; }
          .btn-neo-uploader { border-style: dashed !important; height: 42px !important; font-weight: 700; font-size: 11px; }
          
          .slug-config-box { display: flex; flex-direction: column; gap: 8px; }
          .slug-switch-area { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
          .slug-readonly { color: #444 !important; font-family: 'Mono', monospace; }
          .slug-active { color: #ff6600 !important; border-color: #ff6600 !important; font-family: 'Mono', monospace; }

          .modal-danger-title { color: #ef4444; font-weight: 900; }
          .btn-modal-danger-ok { background: #ef4444 !important; border: none !important; font-weight: 800; }
          .btn-modal-danger-cancel { background: #1a1a1a !important; border: 1px solid #222 !important; color: #666 !important; font-weight: 800; }
          
          .ant-pagination-item { background: #161616 !important; border-color: #262626 !important; }
          .ant-pagination-item-active { border-color: #ff6600 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default CategoryPage;
