import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Tag,
  Space,
  Image,
  Pagination,
  Row,
  Col,
  message,
  Typography,
  ConfigProvider,
  Card,
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  AudioOutlined,
  ControlOutlined,
  FileExcelOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  BlockOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

// Import API
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  deleteVariant,
  editVariant,
  createVariant,
} from "../api/productApi";
import { getBrands } from "../api/brandApi";
import { getCategories } from "../api/categoryApi";
import { getCoupons } from "../api/couponApi";

const { Option } = Select;
const { Title, Text } = Typography;

const Products = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const navigate = useNavigate();
  const limit = 10;

  // ================= STATE LOGIC =================
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [coupons, setCoupons] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variants, setVariants] = useState([]);
  const [variantLoading, setVariantLoading] = useState(null);

  // ================= FETCH LOGIC =================
  useEffect(() => {
    fetchProducts(currentPage);
    fetchOptions();
  }, [currentPage, search, filterCategory, filterBrand, filterStatus]);

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const filters = {
        search,
        category_id: filterCategory,
        brand_id: filterBrand,
        status: filterStatus,
      };
      const res = await getProducts(page, limit, filters);
      setProducts(res.data);
      setCurrentPage(res.currentPage);
      setTotalPages(res.totalPages);
    } catch (err) {
      message.error("Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [b, c, co] = await Promise.all([
        getBrands(),
        getCategories(),
        getCoupons(),
      ]);
      setBrands(b.data);
      setCategories(c.data);
      setCoupons(co.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // ================= HANDLERS SẢN PHẨM =================
  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key !== "image") {
          const val = values[key];
          if (val !== undefined && val !== null && val !== "") {
            formData.append(key, val);
          }
        }
      });

      if (values.image?.fileList && values.image.fileList.length > 0) {
        formData.append("image", values.image.fileList[0].originFileObj);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        message.success("Cập nhật thành công");
      } else {
        await createProduct(formData);
        message.success("Thêm mới thành công");
      }

      setShowModal(false);
      fetchProducts(currentPage);
    } catch (e) {
      message.error("Vui lòng điền đủ các trường bắt buộc (Tên, Slug, Giá)");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận gỡ bỏ sản phẩm",
      content:
        "Mọi dữ liệu biến thể liên quan sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?",
      okText: "XÓA VĨNH VIỄN",
      okType: "danger",
      centered: true,
      className: "neo-danger-modal",
      onOk: async () => {
        await deleteProduct(id);
        message.success("Đã gỡ bỏ sản phẩm khỏi hệ thống");
        fetchProducts(currentPage);
      },
    });
  };

  // ================= HANDLERS BIẾN THỂ =================
  const openVariantModal = (product) => {
    setEditingProduct(product);
    setVariants(product.variants || []);
    setShowVariantModal(true);
  };

  const updateVariantState = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        name_variant: "",
        color: "",
        power: "",
        connection_type: "Bluetooth",
        has_microphone: 0,
        price: 0,
        stock: 0,
        isNew: true,
      },
    ]);
  };

  const handleUpdateVariant = async (v, index) => {
    if (!v.name_variant || v.price === undefined) {
      return message.warning("Vui lòng nhập tên và giá biến thể");
    }

    setVariantLoading(index);
    try {
      const formData = new FormData();
      formData.append("product_id", editingProduct.id);
      formData.append("name_variant", v.name_variant);
      formData.append("color", v.color || "");
      formData.append("power", v.power || "");
      formData.append("connection_type", v.connection_type || "Bluetooth");
      formData.append("has_microphone", v.has_microphone ? 1 : 0);
      formData.append("price", v.price || 0);
      formData.append("stock", v.stock || 0);

      if (v.rawFile) formData.append("image", v.rawFile);

      if (v.id) {
        await editVariant(v.id, formData);
        message.success(`Đã cập nhật: ${v.name_variant}`);
      } else {
        const res = await createVariant(formData);
        const newId = res.data?.id || res.id;
        if (newId) {
          const updatedVariants = [...variants];
          updatedVariants[index].id = newId;
          updatedVariants[index].isNew = false;
          setVariants(updatedVariants);
          message.success("Tạo mới biến thể thành công");
        }
      }
      fetchProducts(currentPage);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi cấu hình dữ liệu");
    } finally {
      setVariantLoading(null);
    }
  };

  const handleRemoveVariant = async (id, index) => {
    if (!id) {
      setVariants(variants.filter((_, i) => i !== index));
      return;
    }
    Modal.confirm({
      title: "Xác nhận gỡ bỏ biến thể",
      content:
        "Hành động này sẽ loại bỏ vĩnh viễn cấu hình phiên bản âm thanh này!",
      okText: "XÓA BIẾN THỂ",
      okType: "danger",
      centered: true,
      onOk: async () => {
        await deleteVariant(id);
        message.success("Đã xóa");
        setVariants(variants.filter((_, i) => i !== index));
        fetchProducts(currentPage);
      },
    });
  };

  const handleExportExcel = () => {
    const data = products.map((p, index) => ({
      STT: index + 1,
      "Tên sản phẩm": p.name,
      "Thương hiệu": p.brand_name,
      "Danh mục": p.category_name,
      "Giá niêm yết": p.price,
      "Trạng thái": p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([excelBuffer]), "DanhSachSanPham.xlsx");
  };

  const columns = [
    {
      title: "SẢN PHẨM & PHÂN LOẠI",
      key: "name",
      render: (_, record) => (
        <Space size="middle">
          <div className="product-avatar-frame">
            <Image
              width={54}
              height={54}
              src={
                record.image
                  ? `${WEB_URL}/uploads/products/${record.image}`
                  : "https://via.placeholder.com/54"
              }
              preview={{ mask: <EyeOutlined style={{ fontSize: 14 }} /> }}
            />
          </div>
          <div>
            <span className="p-main-title">{record.name?.toUpperCase()}</span>
            <span className="p-sub-breadcrumbs">
              {record.brand_name} • {record.category_name}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "GIÁ NIÊM YẾT MẪU",
      dataIndex: "price",
      width: 180,
      render: (p) => (
        <span className="p-price-highlight">
          {Number(p).toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "HỆ THỐNG",
      dataIndex: "status",
      width: 150,
      render: (s) => (
        <span
          className={`status-tag-pill ${s === "active" ? "active" : "inactive"}`}
        >
          ● {s === "active" ? "ONLINE" : "OFFLINE"}
        </span>
      ),
    },
    {
      title: "QUẢN TRỊ",
      key: "actions",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            className="btn-table-action view"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/productDetail/${record.id}`)}
          />
          <Button
            type="text"
            className="btn-table-action edit"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record);
              form.setFieldsValue(record);
              setShowModal(true);
            }}
          />
          <Button
            type="text"
            className="btn-table-action add-variant"
            icon={<PlusOutlined />}
            onClick={() => openVariantModal(record)}
          />
          <Button
            type="text"
            danger
            className="btn-table-action delete"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
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
          colorBorder: "#222",
        },
      }}
    >
      <div className="inventory-dashboard-layout">
        {/* TOP BAR BAR */}
        <div className="bento-header-panel mb-5">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={2} className="m-0 studio-title">
                <AudioOutlined className="glow-icon" /> Quản Lý Sản Phẩm
              </Title>
              <Text className="studio-subtitle">
                Hệ thống phân phối, cấu hình biến thể âm thanh & kiểm kê kho
                hàng
              </Text>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  className="btn-studio-excel"
                >
                  XUẤT DỮ LIỆU
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setEditingProduct(null);
                    setShowModal(true);
                  }}
                  className="btn-studio-primary"
                >
                  KHỞI TẠO SẢN PHẨM
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* BỘ LỌC BENTO */}
        <Card className="bento-filter-panel mb-4" bordered={false}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={8} lg={6}>
              <Input
                prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
                placeholder="Tìm tên sản phẩm cơ sở..."
                onChange={(e) => setSearch(e.target.value)}
                className="studio-input"
                allowClear
              />
            </Col>
            <Col xs={12} sm={4} lg={4}>
              <Select
                placeholder="Mọi danh mục"
                style={{ width: "100%" }}
                allowClear
                onChange={setFilterCategory}
                popupClassName="studio-dropdown"
              >
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4} lg={4}>
              <Select
                placeholder="Mọi thương hiệu"
                style={{ width: "100%" }}
                allowClear
                onChange={setFilterBrand}
                popupClassName="studio-dropdown"
              >
                {brands.map((b) => (
                  <Option key={b.id} value={b.id}>
                    {b.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4} lg={4}>
              <Select
                placeholder="Mọi trạng thái"
                style={{ width: "100%" }}
                allowClear
                onChange={setFilterStatus}
                popupClassName="studio-dropdown"
              >
                <Option value="active">ONLINE</Option>
                <Option value="inactive">OFFLINE</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4} lg={6}>
              <Button
                block
                type="primary"
                ghost
                icon={<FilterOutlined />}
                onClick={() => fetchProducts(1)}
                className="btn-studio-filter"
              >
                ĐỒNG BỘ BỘ LỌC
              </Button>
            </Col>
          </Row>
        </Card>

        {/* DATA TABLE BENTO */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="studio-table-container"
        >
          <Table
            loading={loading}
            rowKey="id"
            columns={columns}
            dataSource={products}
            pagination={false}
            className="studio-custom-table"
            expandable={{
              expandedRowRender: (record) => (
                <div className="expanded-variants-box">
                  <div className="v-box-header">
                    <Text className="v-box-title">
                      <BlockOutlined /> DANH SÁCH BIẾN THỂ THƯƠNG MẠI
                    </Text>
                  </div>
                  <Table
                    rowKey="id"
                    size="small"
                    dataSource={record.variants}
                    pagination={false}
                    className="studio-sub-table"
                    columns={[
                      {
                        title: "MÃ PHIÊN BẢN",
                        dataIndex: "name_variant",
                        render: (t) => (
                          <Text style={{ color: "#fff", fontWeight: 700 }}>
                            {t}
                          </Text>
                        ),
                      },
                      {
                        title: "MÀU SẮC",
                        dataIndex: "color",
                        render: (t) =>
                          t ? (
                            <Tag
                              color="#222"
                              style={{
                                color: "#aaa",
                                border: "1px solid #333",
                              }}
                            >
                              {t}
                            </Tag>
                          ) : (
                            "—"
                          ),
                      },
                      {
                        title: "CÔNG SUẤT",
                        dataIndex: "power",
                        render: (t) =>
                          t ? (
                            <Text
                              style={{
                                color: "#ff6600",
                                fontFamily: "monospace",
                              }}
                            >
                              {t}
                            </Text>
                          ) : (
                            "—"
                          ),
                      },
                      {
                        title: "KẾT NỐI",
                        dataIndex: "connection_type",
                        render: (t) => (
                          <Text style={{ fontSize: 12, color: "#aaa" }}>
                            {t}
                          </Text>
                        ),
                      },
                      {
                        title: "GIÁ THƯƠNG MẠI",
                        render: (v) => (
                          <Text style={{ color: "#fff", fontWeight: 800 }}>
                            {Number(v.price).toLocaleString()}₫
                          </Text>
                        ),
                      },
                      {
                        title: "KHO KHẢ DỤNG",
                        dataIndex: "stock",
                        render: (s) => (
                          <Text
                            style={{
                              color: s > 0 ? "#22c55e" : "#ef4444",
                              fontWeight: 700,
                            }}
                          >
                            {s} thiết bị
                          </Text>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
              expandIcon: ({ expanded, onExpand, record }) => (
                <ControlOutlined
                  className={`studio-expand-trigger ${expanded ? "active" : ""}`}
                  onClick={(e) => onExpand(record, e)}
                />
              ),
            }}
          />
          <div className="studio-pagination-footer">
            <Pagination
              current={currentPage}
              total={totalPages * limit}
              pageSize={limit}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </motion.div>

        {/* MODAL SẢN PHẨM CƠ SỞ */}
        <Modal
          title={
            <div className="studio-modal-header">
              {editingProduct
                ? "HIỆU CHỈNH THÔNG TIN SẢN PHẨM"
                : "THIẾT LẬP SẢN PHẨM MỚI"}
            </div>
          }
          open={showModal}
          onOk={handleSaveProduct}
          onCancel={() => setShowModal(false)}
          width={800}
          centered
          className="studio-form-modal"
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="TÊN THIẾT BỊ HỆ THỐNG"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="VD: Amply Karaoke Boston Acoustic"
                    onChange={(e) =>
                      form.setFieldsValue({
                        slug: generateSlug(e.target.value),
                      })
                    }
                    className="studio-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="slug" label="ĐƯỜNG DẪN HỆ THỐNG (SLUG)">
                  <Input
                    placeholder="Tự động khởi tạo cấu trúc..."
                    className="studio-input font-mono"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="brand_id" label="THƯƠNG HIỆU PHÂN PHỐI">
                  <Select
                    placeholder="Lựa chọn đối tác"
                    className="studio-select"
                    popupClassName="studio-dropdown"
                  >
                    {brands.map((b) => (
                      <Option key={b.id} value={b.id}>
                        {b.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="category_id" label="DANH MỤC PHÂN CẤP">
                  <Select
                    placeholder="Lựa chọn phân loại"
                    className="studio-select"
                    popupClassName="studio-dropdown"
                  >
                    {categories.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="price" label="GIÁ NIÊM YẾT GỐC">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    className="studio-number-input"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="TRẠNG THÁI HIỂN THỊ">
                  <Select
                    defaultValue="active"
                    className="studio-select"
                    popupClassName="studio-dropdown"
                  >
                    <Option value="active">ONLINE (HOẠT ĐỘNG)</Option>
                    <Option value="inactive">OFFLINE (TẠM ẨN)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="coupon_id" label="MÃ GIẢM GIÁ ĐÍNH KÈM">
                  <Select
                    placeholder="Chọn chiến dịch áp dụng"
                    className="studio-select"
                    popupClassName="studio-dropdown"
                    allowClear
                  >
                    {coupons.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.code}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="image" label="HÌNH ẢNH CỐT LÕI (SẢN PHẨM)">
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    listType="picture"
                    className="studio-uploader"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      block
                      className="btn-studio-upload"
                    >
                      TẢI TẬP TIN LÊN
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="MÔ TẢ KỸ THUẬT TỔNG QUAN">
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập cấu trúc thông số chính hoặc giới thiệu dòng máy..."
                    className="studio-textarea"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* MODAL BIẾN THỂ ENGINE */}
        <Modal
          title={
            <div className="studio-variant-header">
              <span className="v-badge">
                <ThunderboltOutlined /> BIẾN THỂ THƯƠNG MẠI
              </span>
              <span className="v-product-name">
                {editingProduct?.name.toUpperCase()}
              </span>
            </div>
          }
          open={showVariantModal}
          onCancel={() => setShowVariantModal(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              className="btn-studio-primary"
              onClick={() => setShowVariantModal(false)}
            >
              HOÀN TẤT VÀ LƯU HỆ THỐNG
            </Button>,
          ]}
          width={1150}
          centered
          className="studio-variant-modal"
        >
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={addVariantRow}
            className="btn-add-variant-dashed mb-4"
          >
            KHỞI TẠO THÊM PHIÊN BẢN CẤU HÌNH MỚI
          </Button>

          <div className="variants-scroll-viewport">
            {variants.map((v, i) => (
              <div
                key={i}
                className={`variant-matrix-card ${v.id ? "synced" : "draft"}`}
              >
                <Row gutter={[16, 12]} align="middle">
                  <Col span={5}>
                    <label className="matrix-input-label">
                      MÃ PHIÊN BẢN (TÊN VỊ TRÍ)
                    </label>
                    <Input
                      value={v.name_variant}
                      onChange={(e) =>
                        updateVariantState(i, "name_variant", e.target.value)
                      }
                      placeholder="VD: Premium Edition"
                      className="studio-input"
                    />
                  </Col>
                  <Col span={3}>
                    <label className="matrix-input-label">MÀU SẮC</label>
                    <Input
                      value={v.color}
                      onChange={(e) =>
                        updateVariantState(i, "color", e.target.value)
                      }
                      placeholder="VD: Titanium"
                      className="studio-input"
                    />
                  </Col>
                  <Col span={3}>
                    <label className="matrix-input-label">CÔNG SUẤT</label>
                    <Input
                      value={v.power}
                      onChange={(e) =>
                        updateVariantState(i, "power", e.target.value)
                      }
                      placeholder="VD: 150W"
                      className="studio-input"
                    />
                  </Col>
                  <Col span={4}>
                    <label className="matrix-input-label">
                      GIAO THỨC KẾT NỐI
                    </label>
                    <Select
                      value={v.connection_type}
                      style={{ width: "100%" }}
                      onChange={(val) =>
                        updateVariantState(i, "connection_type", val)
                      }
                      popupClassName="studio-dropdown"
                    >
                      <Option value="Bluetooth">Bluetooth 5.3</Option>
                      <Option value="Wired">Wired (Dây Optical/RCA)</Option>
                      <Option value="Wireless">Wireless 2.4Ghz</Option>
                    </Select>
                  </Col>
                  <Col span={4}>
                    <label className="matrix-input-label">
                      MICROPHONE KÈM THEO
                    </label>
                    <Select
                      value={v.has_microphone}
                      style={{ width: "100%" }}
                      onChange={(val) =>
                        updateVariantState(i, "has_microphone", val)
                      }
                      popupClassName="studio-dropdown"
                    >
                      <Option value={1}>Có tích hợp micro không dây</Option>
                      <Option value={0}>Không kèm micro</Option>
                    </Select>
                  </Col>
                  <Col span={5}>
                    <label className="matrix-input-label">
                      GIÁ THƯƠNG MẠI CHÍNH THỨC
                    </label>
                    <InputNumber
                      style={{ width: "100%" }}
                      value={v.price}
                      formatter={(val) =>
                        `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      onChange={(val) => updateVariantState(i, "price", val)}
                      className="studio-number-input"
                    />
                  </Col>

                  <Col span={4}>
                    <label className="matrix-input-label">
                      KHO HÀNG KHẢ DỤNG
                    </label>
                    <InputNumber
                      style={{ width: "100%" }}
                      value={v.stock}
                      onChange={(val) => updateVariantState(i, "stock", val)}
                      className="studio-number-input"
                    />
                  </Col>
                  <Col span={13}>
                    <label className="matrix-input-label">
                      FILE ẢNH ĐẠI DIỆN PHIÊN BẢN
                    </label>
                    <Upload
                      maxCount={1}
                      beforeUpload={(file) => {
                        updateVariantState(i, "rawFile", file);
                        return false;
                      }}
                      showUploadList={true}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="btn-matrix-upload"
                        block
                      >
                        {v.id ? "Thay tệp hình ảnh" : "Chọn tệp hình ảnh"}
                      </Button>
                    </Upload>
                  </Col>
                  <Col span={7} className="text-end" style={{ paddingTop: 18 }}>
                    <Space>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={variantLoading === i}
                        onClick={() => handleUpdateVariant(v, i)}
                        className="btn-matrix-save"
                      >
                        {v.id ? "CẬP NHẬT" : "KHỞI CHẠY"}
                      </Button>
                      <Button
                        danger
                        ghost
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveVariant(v.id, i)}
                        className="btn-matrix-delete"
                      />
                    </Space>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Modal>

        <style>{`
          .inventory-dashboard-layout { padding: 30px; background: #080808; min-height: 100vh; font-family: 'Inter', sans-serif; color: #fff; }
          .mb-4 { margin-bottom: 16px; }
          .mb-5 { margin-bottom: 24px; }
          .m-0 { margin: 0 !important; }
          .font-mono { font-family: 'Space Mono', monospace !important; }
          .text-end { text-align: right; }

          /* Header Style */
          .bento-header-panel { background: #111; border: 1px solid #1a1a1a; border-radius: 16px; padding: 24px; }
          .studio-title { font-weight: 900 !important; letter-spacing: -1.5px; color: #fff !important; display: flex; align-items: center; }
          .glow-icon { color: #ff6600; margin-right: 15px; filter: drop-shadow(0 0 8px rgba(255,102,0,0.4)); }
          .studio-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fff; font-weight: 700; display: block; margin-top: 4px; }
          
          .btn-studio-excel { background: #141414 !important; border: 1px solid #222 !important; color: #22c55e !important; font-weight: 700; border-radius: 8px; height: 42px; }
          .btn-studio-primary { background: #ff6600 !important; border: none !important; font-weight: 800 !important; border-radius: 8px; height: 42px; box-shadow: 0 4px 15px rgba(255,102,0,0.2); }

          /* Filter Panel */
          .bento-filter-panel { background: #111 !important; border: 1px solid #1a1a1a !important; border-radius: 16px !important; padding: 4px; }
          .btn-studio-filter { border-color: #ff6600 !important; color: #ff6600 !important; font-weight: 700; border-radius: 8px; height: 38px; }

          /* Custom Inputs & Selects global for theme */
          .studio-input{
          color: #d6d6d6 !important;
          .studio-input, .ant-select-selector, .studio-number-input, .studio-textarea, .btn-studio-upload, .btn-matrix-upload {
            background: #141414 !important; border: 1px solid #222 !important; border-radius: 8px !important; color: #c6c6c6 !important;
          }
          .studio-textarea { padding: 12px !important; }
          .ant-select-selector { height: 38px !important; display: flex; align-items: center; }
          .studio-number-input input { color: #fff !important; height: 36px !important; }

          /* Dropdown Custom Custom */
          .studio-dropdown { background-color: #0e0e0e !important; border: 1px solid #222 !important; border-radius: 10px; padding: 4px; }
          .studio-dropdown .ant-select-item { color: #aaa !important; font-size: 12px; font-weight: 600; border-radius: 6px; }
          .studio-dropdown .ant-select-item-option-active { background-color: #1a1a1a !important; color: #fff !important; }
          .studio-dropdown .ant-select-item-option-selected { background-color: #ff6600 !important; color: #fff !important; }

          /* Main Table Grid */
          .studio-table-container { background: #111; border: 1px solid #1a1a1a; border-radius: 20px; overflow: hidden; }
          .studio-custom-table .ant-table { background: transparent !important; }
          .studio-custom-table .ant-table-thead > tr > th { background: #161616 !important; color: #dcdcdc !important; font-size: 10px !important; font-weight: 800 !important; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1a1a1a !important; padding: 18px 24px !important; }
          .studio-custom-table .ant-table-tbody > tr > td { border-bottom: 1px solid #151515 !important; padding: 16px 24px !important; }
          .studio-custom-table .ant-table-tbody > tr:hover > td { background: #141414 !important; }

          /* Cells Style */
          .product-avatar-frame { background: #161616; border: 1px solid #262626; padding: 4px; border-radius: 10px; display: inline-block; overflow: hidden; }
          .p-main-title { color: #fff; font-weight: 800; font-size: 14px; display: block; letter-spacing: -0.3px; }
          .p-sub-breadcrumbs { color: #fff; font-size: 11px; font-weight: 600; display: block; margin-top: 2px; }
          .p-price-highlight { color: #ff6600; font-family: 'Space Mono', monospace; font-weight: 800; font-size: 14px; }
          
          .status-tag-pill { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; }
          .status-tag-pill.active { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
          .status-tag-pill.inactive { color: #666; background: rgba(255, 255, 255, 0.05); }

          /* Action Buttons */
          .btn-table-action { background: #181818 !important; border-radius: 6px; font-size: 13px; margin: 0 2px; color: #aaa; }
          .btn-table-action:hover { background: #222 !important; }
          .btn-table-action.view:hover { color: #22c55e !important; }
          .btn-table-action.edit:hover { color: #40a9ff !important; }
          .btn-table-action.add-variant:hover { color: #ff6600 !important; }

          /* Sub Expand Area */
          .studio-expand-trigger { color: #fff; cursor: pointer; transition: all 0.3s; font-size: 14px; }
          .studio-expand-trigger.active { color: #ff6600; transform: rotate(90deg); }
          .expanded-variants-box { background: #080808; border: 1px solid #161616; padding: 20px; border-radius: 12px; margin: 5px 0; }
          .v-box-header { margin-bottom: 15px; border-left: 2px solid #ff6600; padding-left: 10px; }
          .v-box-title { color: #555 !important; font-size: 10px; font-weight: 800; letter-spacing: 1px; }
          
          .studio-sub-table .ant-table { background: transparent !important; }
          .studio-sub-table .ant-table-thead > tr > th { background: #0e0e0e !important; color: #333 !important; font-size: 9px !important; border-bottom: 1px solid #141414 !important; padding: 10px 16px !important; }
          .studio-sub-table .ant-table-tbody > tr > td { border-bottom: 1px solid #0e0e0e !important; padding: 12px 16px !important; font-size: 13px; }

          .studio-pagination-footer { padding: 18px 24px; display: flex; justify-content: flex-end; border-top: 1px solid #151515; }
          .ant-pagination-item { background: #161616 !important; border-color: #222 !important; }
          .ant-pagination-item-active { border-color: #ff6600 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }

          /* Modals Base Styling */
          .studio-form-modal .ant-modal-content, .studio-variant-modal .ant-modal-content {
            background: #0e0e0e !important; border: 1px solid #222 !important; border-radius: 24px !important; padding: 24px !important;
          }
          .studio-modal-header { color: #fff; font-size: 16px; font-weight: 900; letter-spacing: -0.5px; border-bottom: 1px solid #1a1a1a; padding-bottom: 14px; }
          .ant-form-item-label label { color: #555 !important; font-size: 10px !important; font-weight: 800 !important; letter-spacing: 0.5px; }

          /* Variant Matrix Configurator */
          .studio-variant-header { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px dashed #222; padding-bottom: 14px; }
          .v-badge { font-size: 10px; font-weight: 900; color: #ff6600; letter-spacing: 1px; }
          .v-product-name { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
          .btn-add-variant-dashed { height: 44px; border-radius: 10px !important; font-weight: 800; font-size: 12px; color: #ff6600 !important; border-color: #ff6600 !important; background: rgba(255,102,0,0.02) !important; }
          
          .variants-scroll-viewport { max-height: 520px; overflow-y: auto; padding-right: 6px; }
          .variant-matrix-card { background: #121212; border-radius: 14px; padding: 20px; margin-bottom: 16px; position: relative; }
          .variant-matrix-card.draft { border: 1px dashed #ff6600; background: rgba(255,102,0,0.01); }
          .variant-matrix-card.synced { border: 1px solid #1a1a1a; }
          
          .matrix-input-label { display: block; color: #fff; font-size: 9px; font-weight: 800; margin-bottom: 6px; letter-spacing: 0.5px; }
          .btn-matrix-save { background: #ff6600 !important; border: none !important; font-weight: 800; font-size: 11px; height: 34px; border-radius: 6px !important; }
          .btn-matrix-delete { background: #1a1a1a !important; border: 1px solid #effff433 !important; height: 34px; border-radius: 6px !important; }

          /* Custom Alert Overrides */
          .neo-danger-modal .ant-modal-content { border: 1px solid #ef4444 !important; border-radius: 16px !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Products;
