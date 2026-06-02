import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Tag,
  Space,
  Image,
  Pagination,
  Typography,
  Row,
  Col,
  ConfigProvider,
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  GlobalOutlined,
  RocketOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
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
    text
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\- ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/\-+/g, "-");

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
      title: (
        <span className="modal-danger-title">⚠️ XÓA ĐỐI TÁC THƯƠNG HIỆU</span>
      ),
      content: (
        <div style={{ marginTop: 10 }}>
          <Text style={{ color: "#aaa" }}>
            Hành động này sẽ xóa vĩnh viễn cấu hình dữ liệu của hãng khỏi danh
            mục hệ thống:
          </Text>
          <strong
            style={{
              color: "#ffffff",
              display: "block",
              marginTop: 5,
              fontSize: 14,
            }}
          >
            {brand.name?.toUpperCase()}
          </strong>
        </div>
      ),
      okText: "XÓA VĨNH VIỄN",
      cancelText: "QUAY LẠI",
      centered: true,
      okButtonProps: { danger: true, className: "btn-modal-danger-ok" },
      cancelButtonProps: { className: "btn-modal-danger-cancel" },
      onOk: async () => {
        try {
          await deleteBrand(brand.id);
          toast.success("Đã xóa thương hiệu thành công");
          loadBrands();
        } catch {
          toast.error("Lỗi khi xóa");
        }
      },
    });
  };

  const columns = [
    {
      title: "INDEX",
      width: 80,
      render: (_, __, i) => (
        <span className="index-cell">#{(page - 1) * limit + i + 1}</span>
      ),
    },
    {
      title: "LOGO ĐỐI TÁC",
      dataIndex: "logo",
      width: 130,
      render: (logo) => (
        <div className="brand-logo-frame">
          <Image
            width={72}
            height={44}
            src={`${WEB_URL}/uploads/products/${logo}`}
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
      title: "TÊN THƯƠNG HIỆU",
      dataIndex: "name",
      render: (t) => <span className="brand-name-txt">{t?.toUpperCase()}</span>,
    },
    {
      title: "QUỐC GIA XUẤT XỨ",
      dataIndex: "origin",
      render: (o) => (
        <span className="origin-pill">
          <GlobalOutlined /> {o?.toUpperCase() || "N/A"}
        </span>
      ),
    },
    {
      title: "TÓM TẮT GIỚI THIỆU",
      dataIndex: "description",
      render: (d) => (
        <span className="description-txt">
          {d?.length > 50 ? d.slice(0, 50) + "..." : d || "—"}
        </span>
      ),
    },
    {
      title: "TRẠNG THÁI HỢP TÁC",
      dataIndex: "status",
      width: 180,
      render: (s) => (
        <span
          className={`status-pill ${s === "active" ? "active" : "inactive"}`}
        >
          ● {s === "active" ? "ĐANG KINH DOANH" : "NGỪNG HỢP TÁC"}
        </span>
      ),
    },
    {
      title: "BẢNG ĐIỀU KHIỂN",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="btn-action-view"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Button
            type="text"
            danger
            className="btn-action-delete"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
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
          colorPrimary: "#ff5302",
          colorBorder: "#222222",
        },
      }}
    >
      <div className="admin-bento-layout">
        {/* TOP TOOLBAR: HEADER & CONTROLS CONTROL BAR */}
        <div className="filter-bento-bar mb-4">
          <Row gutter={[24, 16]} justify="space-between" align="middle">
            <Col xs={24} md={14}>
              <div className="page-headline-block">
                <Title level={2} className="m-0 page-main-title">
                  <RocketOutlined className="title-icon" /> Quản lý thương hiệu
                </Title>
                <Text className="text-muted letter-spacing-1">
                  Danh bạ lưu trữ nhà sản xuất đối tác, quản lý hồ sơ định danh
                  và chỉ số xuất xứ chuỗi cung ứng
                </Text>
              </div>
            </Col>
            <Col xs={24} md={10} className="text-end">
              <Space size="middle" className="mobile-full-width-space">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tra cứu tên hãng hoặc quốc gia..."
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
                  onClick={openAdd}
                  className="btn-neo-primary"
                >
                  TẠO THƯƠNG HIỆU
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* DATA GRID BENTO BOX */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="table-bento-container"
        >
          <Table
            columns={columns}
            dataSource={brands}
            rowKey="id"
            loading={loading}
            className="custom-neo-table"
            pagination={false}
          />

          {/* CONTROL FOOTER PAGINATION */}
          <div className="neo-pagination-wrapper">
            <Pagination
              current={page}
              total={totalPages * limit}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        </motion.div>

        {/* NEO DESIGN SIDE-COLUMN / GRID MODAL */}
        <Modal
          open={openModal}
          onCancel={() => setOpenModal(false)}
          title={
            <div className="form-modal-header-title">
              {editBrand
                ? "Cập nhật hồ sơ đối tác"
                : "Phát hành hồ sơ thương hiệu mới"}
            </div>
          }
          onOk={() => form.submit()}
          okText={editBrand ? "CẬP NHẬT DỮ LIỆU" : "KHỞI CHẠY THƯƠNG HIỆU"}
          cancelText="HỦY LỆNH"
          width={700}
          centered
          className="neo-form-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="neo-form-container"
          >
            <div className="form-sub-section-title">
              <RocketOutlined /> ĐỊNH DANH THƯƠNG HIỆU
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên thương hiệu đối tác"
                  rules={[
                    { required: true, message: "Vui lòng điền tên hãng" },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Sony, Focal, Sennheiser..."
                    className="neo-form-input"
                    onChange={(e) =>
                      form.setFieldsValue({ slug: slugify(e.target.value) })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="origin" label="Quốc gia xuất xứ">
                  <Input
                    placeholder="Ví dụ: Japan, France, Germany..."
                    className="neo-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="slug" label="Đường dẫn hệ thống (Auto-Slug)">
              <Input
                prefix={<LinkOutlined className="input-prefix-icon" />}
                className="neo-form-input slug-glow"
              />
            </Form.Item>

            <div className="form-sub-section-title">
              <InfoCircleOutlined /> DIỄN GIẢI CHÍNH SÁCH HÃNG
            </div>
            <Form.Item
              name="description"
              label="Nội dung giới thiệu / Lịch sử thương hiệu"
            >
              <Input.TextArea
                rows={3}
                className="neo-form-textarea"
                placeholder="Tóm tắt thông tin thành lập, các dòng sản phẩm đặc trưng chiến lược..."
              />
            </Form.Item>

            <Row gutter={16} align="bottom">
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái triển khai kinh doanh"
                  initialValue="active"
                >
                  <Select
                    popupClassName="neo-select-dropdown"
                    className="neo-form-select"
                  >
                    <Select.Option value="active">
                      KÍCH HOẠT KINH DOANH
                    </Select.Option>
                    <Select.Option value="inactive">
                      TẠM NGƯNG HỢP TÁC
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="logo"
                  label="Logo nhận diện (Tỉ lệ chuẩn hình chữ nhật)"
                >
                  <Upload
                    beforeUpload={() => false}
                    listType="picture"
                    maxCount={1}
                    className="neo-brand-uploader"
                  >
                    <Button
                      block
                      icon={<UploadOutlined />}
                      className="btn-neo-uploader"
                    >
                      CHỌN TẬP TIN LOGO
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <style>{`
          .admin-bento-layout { padding: 30px; background: #080808; min-height: 100vh; color: #ffffff; font-family: 'Inter', sans-serif; }
          .page-main-title { font-weight: 900 !important; letter-spacing: -1px; color: #ffffff !important; display: flex; align-items: center; }
          .title-icon { color: #ff5302; margin-right: 12px; }
          .letter-spacing-1 { letter-spacing: 0.5px; font-size: 11px; font-weight: 700; color: #444 !important; display: block; margin-top: 4px; }

          /* Filter Control Bar - No Card Background Border Only */
          .filter-bento-bar { background: #111111; border: 1px solid #222222; border-radius: 16px; padding: 20px; }
          .neo-search-input { background: #161616 !important; border: 1px solid #262626 !important; border-radius: 10px !important; padding: 10px 14px !important; color: #ffffff !important; width: 290px; }
          .neo-search-input .anticon { color: #ff5302 !important; }
          .btn-neo-primary { background: #ff5302 !important; border: none !important; font-weight: 800 !important; border-radius: 10px !important; height: 44px !important; padding: 0 20px !important; letter-spacing: 0.5px; color: #ffffff !important; }
          .btn-neo-primary:hover { background: #ff661d !important; }

          /* Bento Data Containers Table */
          .table-bento-container { background: #111111; border: 1px solid #222222; border-radius: 20px; overflow: hidden; }
          .custom-neo-table .ant-table { background: transparent !important; }
          .custom-neo-table .ant-table-thead > tr > th { font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.5px; border-bottom: 1px solid #222222 !important; padding: 18px 20px !important; color: #dcdcdc !important; background: #161616 !important; }
          .custom-neo-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1a1a1a !important; padding: 16px 20px !important; }

          /* Forced Pure White Components Text Elements */
          .index-cell { font-family: 'Mono', monospace; color: #444444; font-weight: 700; }
          .brand-name-txt { color: #ffffff !important; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; }
          .origin-pill { display: inline-flex; align-items: center; gap: 6px; background: #161616; border: 1px solid #222222; color: #ffffff !important; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 6px; }
          .origin-pill .anticon { color: #ff5302; }
          .description-txt { color: #cccccc !important; font-size: 13px; font-weight: 500; }

          /* Brand Logo Layout Frame */
          .brand-logo-frame { background: #ffffff; border: 1px solid #222222; border-radius: 8px; width: 76px; height: 48px; padding: 1px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
          .brand-logo-frame img { object-fit: contain !important; width: 100%; height: 100%; }
          .custom-preview-mask { background: rgba(255, 83, 2, 0.85); color: #ffffff; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 16px; }

          /* Modern Status Pills */
          .status-pill { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-block; }
          .status-pill.active { color: #22c55e; background: rgba(34, 197, 94, 0.05); }
          .status-pill.inactive { color: #777777; background: rgba(255, 255, 255, 0.02); }

          /* Control Actions Adjustments */
          .btn-action-view { background: #161616 !important; color: #ff5302 !important; border-radius: 8px; }
          .btn-action-view:hover { background: rgba(255, 83, 2, 0.1) !important; }
          .btn-action-delete { background: #161616 !important; color: #ef4444 !important; border-radius: 8px; }
          .btn-action-delete:hover { background: rgba(239, 68, 68, 0.1) !important; }

          /* Pagination custom style wrapper footer */
          .neo-pagination-wrapper { padding: 18px 20px; display: flex; justify-content: flex-end; border-top: 1px solid #161616; background: #131313; }
          .ant-pagination-item { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; }
          .ant-pagination-item a { color: #666666 !important; font-weight: 700; }
          .ant-pagination-item-active { border-color: #ff5302 !important; }
          .ant-pagination-item-active a { color: #ff5302 !important; }
          .ant-pagination-prev .ant-pagination-item-link, .ant-pagination-next .ant-pagination-item-link { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; color: #666666 !important; }

          /* Neo Bento Modal Form layout styling */
          .neo-form-modal .ant-modal-content { background: #0e0e0e !important; border: 1px solid #222222 !important; border-radius: 24px !important; padding: 30px !important; }
          .form-modal-header-title { color: #ffffff !important; font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; }
          .neo-form-container { margin-top: 25px; }
          .form-sub-section-title { font-size: 10px; font-weight: 900; color: #dfdfdf; letter-spacing: 1px; margin: 24px 0 14px; display: flex; align-items: center; gap: 6px; }
          .form-sub-section-title:first-of-type { margin-top: 0; }

          /* Overriding Antd Form Controls */
          .ant-form-item { margin-bottom: 18px !important; }
          .ant-form-item-label label { color: #e0e0e0 !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase; }
          .neo-form-input, .neo-form-select .ant-select-selector, .neo-form-textarea, .btn-neo-uploader { background: #141414 !important; border: 1px solid #222222 !important; border-radius: 10px !important; color: #ffffff !important; width: 100% !important; padding: 8px 12px !important; }
          .neo-form-select .ant-select-selector { padding: 4px 12px !important; height: 42px !important; }
          .neo-form-textarea { padding: 12px !important; }
          .btn-neo-uploader { height: 42px !important; border-style: dashed !important; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .btn-neo-uploader:hover { border-color: #ff5302 !important; color: #ff5302 !important; }

          /* Forced Inner Values Input Colors to White */
          .ant-input, .ant-select-selection-item, .neo-form-textarea { color: #ffffff !important; font-weight: 600 !important; }
          .ant-input::placeholder, .neo-form-textarea::placeholder { color: #dadada !important; }
          .input-prefix-icon { color: #d4d4d4; margin-right: 4px; }
          .slug-glow { color: #ff5302 !important; font-family: 'Mono', monospace; font-size: 13px; }

          /* Select Popup Item overrides */
          .neo-select-dropdown { background: #141414 !important; border: 1px solid #222222 !important; border-radius: 10px !important; padding: 6px !important; }
          .neo-select-dropdown .ant-select-item { color: #efefef !important; font-weight: 600; border-radius: 6px; }
          .neo-select-dropdown .ant-select-item-option-selected { background: #222222 !important; color: #ffffff !important; }

          /* Custom Upload Item Text List Overrides to White */
          .ant-upload-list-item-name { color: #ffffff !important; font-weight: 600; }
          .ant-upload-list-item-card-actions .anticon { color: #ffffff !important; }

          /* Danger Alert Confirmation Overrides */
          .modal-danger-title { color: #ef4444; font-weight: 900; }
          .btn-modal-danger-ok { background: #ef4444 !important; font-weight: 700; border-radius: 8px; border: none !important; color: #ffffff !important; }
          .btn-modal-danger-cancel { background: #161616 !important; border-color: #262626 !important; color: #666666 !important; font-weight: 700; border-radius: 8px; }

          /* Interactive System Outlines Focus Glow */
          .ant-input:focus, .ant-input-focused, .ant-select:focus, .ant-select-focused, .ant-input-textarea:focus { border-color: #ff5302 !important; box-shadow: none !important; }

          @media (max-width: 768px) {
            .neo-search-input { width: 100%; }
            .mobile-full-width-space { width: 100%; justify-content: space-between; }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default BrandPage;
