import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, Upload, Tag, Space,
  Image, Pagination, Row, Col, message, Typography, ConfigProvider, Card, Divider
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined,
  SearchOutlined, FilterOutlined, AudioOutlined, ControlOutlined,
  FileExcelOutlined, SaveOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

// Import API
import {
  getProducts, deleteProduct, createProduct, updateProduct,
  deleteVariant, editVariant, createVariant
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
      const filters = { search, category_id: filterCategory, brand_id: filterBrand, status: filterStatus };
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
      const [b, c, co] = await Promise.all([getBrands(), getCategories(), getCoupons()]);
      setBrands(b.data);
      setCategories(c.data);
      setCoupons(co.data);
    } catch (err) { console.error(err); }
  };

  const generateSlug = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  // ================= HANDLERS SẢN PHẨM =================
const handleSaveProduct = async () => {
  try {
    const values = await form.validateFields();
    const formData = new FormData();

    // Duyệt qua các field, chỉ append những field có giá trị
    Object.keys(values).forEach(key => {
      if (key !== 'image') {
        const val = values[key];
        // Nếu là số 0 hoặc có giá trị thì mới gửi, tránh gửi null/undefined
        if (val !== undefined && val !== null && val !== "") {
          formData.append(key, val);
        }
      }
    });

    // Xử lý ảnh: lấy file từ Ant Design Upload object
    if (values.image?.fileList && values.image.fileList.length > 0) {
      formData.append("image", values.image.fileList[0].originFileObj);
    }

    // Gửi lên API
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
    console.error(e);
    message.error("Vui lòng điền đủ các trường bắt buộc (Tên, Slug, Giá)");
  }
};
  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        await deleteProduct(id);
        message.success("Đã xóa sản phẩm");
        fetchProducts(currentPage);
      }
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
    setVariants([...variants, { 
      name_variant: "", color: "", power: "", 
      connection_type: "Bluetooth", has_microphone: 0, 
      price: 0, stock: 0, isNew: true 
    }]);
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
      
      if (v.rawFile) {
        formData.append("image", v.rawFile);
      }

      if (v.id) {
        await editVariant(v.id, formData);
        message.success(`Cập nhật thành công: ${v.name_variant}`);
      } else {
        const res = await createVariant(formData);
        const newId = res.data?.id || res.id;
        if (newId) {
          const updatedVariants = [...variants];
          updatedVariants[index].id = newId;
          updatedVariants[index].isNew = false;
          setVariants(updatedVariants);
          message.success("Thêm mới biến thể thành công");
        }
      }
      fetchProducts(currentPage);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi lưu dữ liệu");
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
        title: 'Xác nhận xóa',
        content: 'Hành động này sẽ xóa vĩnh viễn biến thể này!',
        okText: 'Xóa',
        okType: 'danger',
        onOk: async () => {
            await deleteVariant(id);
            message.success("Đã xóa");
            const newVariants = variants.filter((_, i) => i !== index);
            setVariants(newVariants);
            fetchProducts(currentPage);
        }
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
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "DanhSachSanPham.xlsx");
  };

  const columns = [
    {
      title: "SẢN PHẨM",
      key: "name",
      render: (_, record) => (
        <Space>
          <Image 
            width={50} 
            src={record.image ? `${WEB_URL}/uploads/products/${record.image}` : "https://via.placeholder.com/50"} 
            style={{ borderRadius: 6, border: '1px solid #333', objectFit: 'cover' }} 
          />
          <div>
            <Text style={{ color: '#FFF', fontWeight: '600', display: 'block' }}>{record.name}</Text>
            <Text style={{ color: '#888', fontSize: '12px' }}>{record.brand_name} | {record.category_name}</Text>
          </div>
        </Space>
      )
    },
    {
      title: "GIÁ NIÊM YẾT",
      dataIndex: "price",
      render: (p) => <Text style={{ color: '#FF6600', fontWeight: 'bold' }}>{Number(p).toLocaleString()}₫</Text>
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "active" ? "#5af30d" : "#333"} style={{ color: s === "active" ? '#000' : '#888', border: 'none' }}>
          {s?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button ghost size="small" icon={<EyeOutlined />} onClick={() => navigate(`/productDetail/${record.id}`)} />
          <Button ghost size="small" style={{ color: '#40A9FF', borderColor: '#40A9FF' }} icon={<EditOutlined />} onClick={() => {
             setEditingProduct(record);
             form.setFieldsValue(record);
             setShowModal(true);
          }} />
          <Button ghost size="small" style={{ color: '#FF6600', borderColor: '#FF6600' }} icon={<PlusOutlined />} onClick={() => openVariantModal(record)} />
          <Button danger ghost size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
<ConfigProvider
  theme={{
    token: { 
      colorBgContainer: "#141414", 
      colorText: "#FFFFFF", 
      colorPrimary: "#FF6600", 
      colorBorder: "#333",
      colorTextPlaceholder: "#888" // Màu cho chữ gợi ý
    },
    components: { 
      Table: { headerBg: "#1A1A1A", rowHoverBg: "#1F1F1F" },
      Input: { colorBgContainer: "#0A0A0A", colorText: "#FFF" },
      Select: { 
        colorBgContainer: "#0A0A0A", 
        colorText: "#FFF", 
        colorTextPlaceholder: "#888",
        controlItemBgActive: "#333" // Màu nền khi chọn item
      },
      Modal: { headerBg: "#1A1A1A", contentBg: "#141414" }
    }
  }}
>
      <div style={{ padding: '24px', background: '#0A0A0A', minHeight: '100vh' }}>
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: '#FFF', margin: 0 }}>
              <AudioOutlined style={{ color: '#FF6600', marginRight: 12 }} />
              Quản Lý Kho Sản Phẩm
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} style={{ background: "#1D6F42", color: "#fff", border: "none" }}>XUẤT EXCEL</Button>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingProduct(null); setShowModal(true); }}>TẠO MỚI</Button>
            </Space>
          </Col>
        </Row>

        {/* BỘ LỌC */}
        <Card style={{ marginBottom: 20, background: '#141414', border: '1px solid #222' }}>
          <Row gutter={12}>
            <Col span={6}><Input prefix={<SearchOutlined />} placeholder="Tìm tên sản phẩm..." onChange={e => setSearch(e.target.value)} /></Col>
            <Col span={4}>
              <Select placeholder="Danh mục" style={{width: '100%'}} allowClear onChange={setFilterCategory}>
                {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
              </Select>
            </Col>
            <Col span={4}>
              <Select placeholder="Thương hiệu" style={{width: '100%'}} allowClear onChange={setFilterBrand}>
                {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
              </Select>
            </Col>
            <Col span={4}>
              <Select placeholder="Trạng thái" style={{width: '100%'}} allowClear onChange={setFilterStatus}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            <Col span={6}><Button block type="primary" ghost icon={<FilterOutlined />} onClick={() => fetchProducts(1)}>ÁP DỤNG BỘ LỌC</Button></Col>
          </Row>
        </Card>

        {/* BẢNG CHÍNH */}
        <Table
          loading={loading}
          rowKey="id"
          columns={columns}
          dataSource={products}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '15px', background: '#000', borderRadius: 8, border: '1px solid #222' }}>
                <Title level={5} style={{ color: '#FF6600', marginBottom: 12 }}>Biến thể sản phẩm</Title>
                <Table
                  rowKey="id"
                  size="small"
                  dataSource={record.variants}
                  pagination={false}
                  columns={[
                    { title: "Phiên bản", dataIndex: "name_variant" },
                    { title: "Màu", dataIndex: "color" },
                    { title: "CS", dataIndex: "power" },
                    { title: "Kết nối", dataIndex: "connection_type" },
                    { title: "Giá", render: v => `${Number(v.price).toLocaleString()}₫` },
                    { title: "Kho", dataIndex: "stock" }
                  ]}
                />
              </div>
            ),
            expandIcon: ({ expanded, onExpand, record }) => <ControlOutlined style={{ color: expanded ? '#FF6600' : '#555', cursor: 'pointer' }} onClick={e => onExpand(record, e)} />
          }}
        />
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Pagination current={currentPage} total={totalPages * limit} pageSize={limit} onChange={setCurrentPage} />
        </div>

        {/* MODAL SẢN PHẨM */}
        <Modal
          title={editingProduct ? "CẬP NHẬT SẢN PHẨM" : "TẠO MỚI SẢN PHẨM"}
          open={showModal}
          onOk={handleSaveProduct}
          onCancel={() => setShowModal(false)}
          width={800}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="name" label="Tên sản phẩm" rules={[{required: true}]}><Input placeholder="Nhập tên..." onChange={e => form.setFieldsValue({slug: generateSlug(e.target.value)})} /></Form.Item></Col>
              <Col span={12}><Form.Item name="slug" label="Slug"><Input placeholder="auto-generate-slug" /></Form.Item></Col>
              <Col span={12}><Form.Item name="brand_id" label="Thương hiệu"><Select placeholder="Chọn thương hiệu">{brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}</Select></Form.Item></Col>
              <Col span={12}><Form.Item name="category_id" label="Danh mục"><Select placeholder="Chọn danh mục">{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select></Form.Item></Col>
              <Col span={8}><Form.Item name="price" label="Giá niêm yết"><InputNumber style={{width: '100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
              <Col span={8}><Form.Item name="status" label="Trạng thái"><Select defaultValue="active"><Option value="active">Active</Option><Option value="inactive">Inactive</Option></Select></Form.Item></Col>
              <Col span={8}><Form.Item name="coupon_id" label="Mã giảm giá"><Select placeholder="Chọn mã giảm giá">{coupons.map(c => <Option key={c.id} value={c.id}>{c.code}</Option>)}</Select></Form.Item></Col>
              <Col span={8}>
                <Form.Item name="image" label="Ảnh đại diện">
                  <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                    <Button icon={<UploadOutlined />} block>Chọn file</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24}><Form.Item name="description" label="Mô tả sản phẩm"><Input.TextArea rows={4} placeholder="Thông tin chi tiết..." /></Form.Item></Col>
            </Row>
          </Form>
        </Modal>

        {/* MODAL BIẾN THỂ */}
        <Modal
          title={<Title level={4} style={{ color: '#FF6600', margin: 0 }}>BIẾN THỂ: {editingProduct?.name.toUpperCase()}</Title>}
          open={showVariantModal}
          footer={[<Button key="close" type="primary" onClick={() => setShowVariantModal(false)}>Hoàn tất & Đóng</Button>]}
          width={1100}
        >
          <Button 
            type="dashed" 
            block 
            icon={<PlusOutlined />} 
            onClick={addVariantRow} 
            style={{ marginBottom: 20, height: 45, color: '#FF6600', borderColor: '#FF6600' }}
          >
            THÊM BIẾN THỂ MỚI
          </Button>

          <div style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
            {variants.map((v, i) => (
              <Card 
                size="small" 
                key={i} 
                style={{ 
                  marginBottom: 16, 
                  background: '#1A1A1A', 
                  border: v.id ? '1px solid #333' : '1px dashed #FF6600' 
                }}
              >
                <Row gutter={[12, 12]}>
                  {/* Row 1 */}
                  <Col span={6}>
                    <Text size="small" style={{ color: '#888' }}>Tên phiên bản</Text>
                    <Input value={v.name_variant} onChange={e => updateVariantState(i, 'name_variant', e.target.value)} placeholder="VD: Bản Pro" />
                  </Col>
                  <Col span={4}>
                    <Text size="small" style={{ color: '#888' }}>Màu sắc</Text>
                    <Input value={v.color} onChange={e => updateVariantState(i, 'color', e.target.value)} placeholder="VD: Đen" />
                  </Col>
                  <Col span={4}>
                    <Text size="small" style={{ color: '#888' }}>Công suất</Text>
                    <Input value={v.power} onChange={e => updateVariantState(i, 'power', e.target.value)} placeholder="VD: 20W" />
                  </Col>
                  <Col span={5}>
                    <Text size="small" style={{ color: '#888' }}>Kết nối</Text>
                    <Select value={v.connection_type} style={{ width: '100%' }} onChange={val => updateVariantState(i, 'connection_type', val)}>
                      <Option value="Bluetooth">Bluetooth</Option>
                      <Option value="Wired">Wired</Option>
                      <Option value="Wireless">Wireless 2.4G</Option>
                    </Select>
                  </Col>
                  <Col span={5}>
                    <Text size="small" style={{ color: '#888' }}>Microphone</Text>
                    <Select value={v.has_microphone} style={{ width: '100%' }} onChange={val => updateVariantState(i, 'has_microphone', val)}>
                      <Option value={1}>Có tích hợp</Option>
                      <Option value={0}>Không</Option>
                    </Select>
                  </Col>

                  {/* Row 2 */}
                  <Col span={6}>
                    <Text size="small" style={{ color: '#888' }}>Giá bán (₫)</Text>
                    <InputNumber 
                      style={{ width: '100%' }} 
                      value={v.price} 
                      formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      onChange={val => updateVariantState(i, 'price', val)} 
                    />
                  </Col>
                  <Col span={4}>
                    <Text size="small" style={{ color: '#888' }}>Số lượng tồn</Text>
                    <InputNumber style={{ width: '100%' }} value={v.stock} onChange={val => updateVariantState(i, 'stock', val)} />
                  </Col>
                  <Col span={8}>
                    <Text size="small" style={{ color: '#888' }}>Ảnh biến thể</Text>
                    <Upload 
                      maxCount={1} 
                      beforeUpload={file => { updateVariantState(i, 'rawFile', file); return false; }} 
                      showUploadList={true}
                    >
                      <Button icon={<UploadOutlined />} style={{ width: '100%' }}>{v.id ? "Thay đổi" : "Chọn ảnh"}</Button>
                    </Upload>
                  </Col>
                  <Col span={6} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <Space>
                      <Button 
                        type="primary" 
                        loading={variantLoading === i}
                        icon={<SaveOutlined />} 
                        onClick={() => handleUpdateVariant(v, i)}
                      >
                        {v.id ? "Cập nhật" : "Lưu mới"}
                      </Button>
                      <Button 
                        danger 
                        ghost
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemoveVariant(v.id, i)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </Modal>

        <style>{`
          .ant-modal-content { border: 1px solid #333; }
          .ant-input-number-input { color: #fff !important; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #FF6600; }
  /* 1. Ép màu cho ô chọn (khi chưa mở) */
  .ant-select-selector {
    background-color: #0A0A0A !important;
    border-color: #333 !important;
    color: #FFF !important;
  }
  
  /* 2. Ép màu cho mũi tên chọn */
  .ant-select-arrow {
    color: #FFF !important;
  }

  /* 3. ĐÂY LÀ QUAN TRỌNG: Ép màu cho bảng danh sách thả xuống (Dropdown) */
  .ant-select-dropdown {
    background-color: #141414 !important; /* Nền tối */
    border: 1px solid #333 !important;
  }

  /* 4. Ép màu chữ trong danh sách chọn */
  .ant-select-item {
    color: #FFF !important;
  }

  /* 5. Hiệu ứng khi di chuột vào item */
  .ant-select-item-option-active {
    background-color: #333 !important;
  }

  /* 6. Hiệu ứng khi item được chọn */
  .ant-select-item-option-selected {
    background-color: #FF6600 !important;
    color: #FFF !important;
  }
  
  /* 7. Màu chữ placeholder */
  .ant-select-selection-placeholder {
    color: #888 !important;
  }
`}</style>
      </div>
    </ConfigProvider>
  );
};

export default Products;