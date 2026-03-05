import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, Upload, Tag, Space,
  Image, Pagination, Spin, Row, Col, message, Typography, ConfigProvider, Card
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined,
  SearchOutlined, FilterOutlined, AudioOutlined, ControlOutlined,
  ThunderboltOutlined, InboxOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileExcelOutlined } from "@ant-design/icons";
import {
  getProducts, deleteProduct, createProduct, updateProduct,
  updateVariants, deleteVariant, editVariant,
} from "../api/productApi";
import { getBrands } from "../api/brandApi";
import { getCategories } from "../api/categoryApi";
import { useNavigate } from "react-router-dom";

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

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variants, setVariants] = useState([]);

  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm] = Form.useForm();

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
      const [b, c] = await Promise.all([getBrands(), getCategories()]);
      setBrands(b.data);
      setCategories(c.data);
    } catch (err) { console.error(err); }
  };

  // ================= HANDLERS =================
  const handleSaveProduct = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    Object.keys(values).forEach(k => { if (k !== 'image') formData.append(k, values[k] || ""); });
    if (values.image?.file) formData.append("image", values.image.file);
    
    try {
        editingProduct ? await updateProduct(editingProduct.id, formData) : await createProduct(formData);
        message.success("Thao tác thành công");
        setShowModal(false); 
        fetchProducts(currentPage);
    } catch (e) { message.error("Lỗi khi lưu dữ liệu"); }
  };
const handleExportExcel = () => {
  if (!products.length) {
    message.warning("Không có dữ liệu để xuất");
    return;
  }

  const data = products.map((p, index) => ({
    STT: index + 1,
    "Tên sản phẩm": p.name,
    "Thương hiệu": p.brand_name,
    "Danh mục": p.category_name,
    "Giá": p.price,
    "Trạng thái": p.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // auto width cột
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(file, "DanhSachSanPham.xlsx");
};
  // ================= COLUMNS =================
  const columns = [
    {
      title: <Text style={{ color: '#E0E0E0' }}>SẢN PHẨM</Text>,
      key: "name",
      render: (_, record) => (
        <Space>
          <Image width={50} src={record.image ? `${WEB_URL}/uploads/products/${record.image}` : "https://via.placeholder.com/50"} style={{ borderRadius: 6, border: '1px solid #333' }} />
          <div>
            <Text style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '600', display: 'block' }}>{record.name}</Text>
            <Text style={{ color: '#A0A0A0', fontSize: '12px' }}>{record.brand_name} • {record.category_name}</Text>
          </div>
        </Space>
      )
    },
    {
      title: <Text style={{ color: '#E0E0E0' }}>GIÁ NIÊM YẾT</Text>,
      dataIndex: "price",
      render: (p) => <Text style={{ color: '#FF6600', fontWeight: '800' }}>{Number(p).toLocaleString()}₫</Text>
    },
    {
      title: <Text style={{ color: '#E0E0E0' }}>TRẠNG THÁI</Text>,
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "active" ? "#5af30d" : "#333"} style={{ color: '#080808', borderRadius: '4px', border: 'none' }}>
          {s?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: <Text style={{ color: '#E0E0E0' }}>HÀNH ĐỘNG</Text>,
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button ghost size="small" icon={<EyeOutlined style={{color: '#FFF'}} />} onClick={() => navigate(`/productDetail/${record.id}`)} />
          <Button ghost size="small" style={{ color: '#40A9FF', borderColor: '#40A9FF' }} icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button ghost size="small" style={{ color: '#FF6600', borderColor: '#FF6600' }} icon={<PlusOutlined />} onClick={() => openVariantModal(record)} />
          <Button danger ghost size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  // Logic variant helpers
  const handleEdit = (record) => { setEditingProduct(record); form.setFieldsValue(record); setShowModal(true); };
  const openVariantModal = (product) => { setEditingProduct(product); setVariants([]); setShowVariantModal(true); };
  const addVariant = () => setVariants([...variants, { name_variant: "", color: "", power: "", price: 0 }]);
  const saveVariants = async () => { await updateVariants(editingProduct.id, variants); setShowVariantModal(false); fetchProducts(currentPage); };
  const openEditVariant = (variant) => { setEditingVariant(variant); variantForm.setFieldsValue(variant); setShowEditVariantModal(true); };
  const saveEditVariant = async () => { const values = await variantForm.validateFields(); await editVariant(editingVariant.id, values); setShowEditVariantModal(false); fetchProducts(currentPage); };
  const removeVariant = async (id) => { if (window.confirm("Xóa biến thể?")) { await deleteVariant(id); fetchProducts(currentPage); } };
  const handleDelete = async (id) => { if (window.confirm("Xóa sản phẩm?")) { await deleteProduct(id); fetchProducts(currentPage); } };

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: "#141414", colorText: "#FFFFFF", colorTextHeading: "#FFFFFF", colorPrimary: "#FF6600", borderRadius: 8, colorBorder: "#333" },
        components: { 
          Table: { headerBg: "#1A1A1A", rowHoverBg: "#1F1F1F", colorText: "#FFFFFF", colorHeader: "#FFFFFF" },
          Modal: { contentBg: "#141414", headerBg: "#141414" },
          Input: { colorBgContainer: "#0A0A0A", colorText: "#FFFFFF", colorTextPlaceholder: "#666" },
          Select: { colorBgContainer: "#0A0A0A", colorText: "#FFFFFF" }
        }
      }}
    >
      <div style={{ paddingBottom: 40, background: '#0A0A0A', minHeight: '100vh' }}>
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: '#FFFFFF', margin: 0 }}>
              <AudioOutlined style={{ color: '#FF6600', marginRight: 12 }} />
              Danh Mục Sản Phẩm
            </Title>
            <Text style={{ color: '#888' }}>Quản lý thiết bị âm thanh cao cấp của bạn</Text>
          </Col>
          <Col>
  <Space>
    <Button
      icon={<FileExcelOutlined />}
      size="large"
      onClick={handleExportExcel}
      style={{
        background: "#1D6F42",
        border: "none",
        color: "#fff",
        fontWeight: "bold"
      }}
    >
      XUẤT EXCEL
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
      style={{
        background: "#FF6600",
        border: "none",
        fontWeight: "bold"
      }}
    >
      TẠO MỚI SẢN PHẨM
    </Button>
  </Space>
</Col>
        </Row>

        {/* BỘ LỌC (FILTER) */}
        <Card style={{ marginBottom: 20, background: '#141414', border: '1px solid #222' }} bodyStyle={{ padding: '16px' }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={6}>
              <Input 
                prefix={<SearchOutlined style={{ color: '#FF6600' }} />} 
                placeholder="Tìm tên sản phẩm..." 
                className="white-text-input"
                onChange={(e) => setSearch(e.target.value)} 
              />
            </Col>
            <Col xs={12} md={4}>
              <Select allowClear placeholder={<span style={{color: '#666'}}>Danh mục</span>} className="white-text-select" onChange={setFilterCategory} style={{ width: '100%' }}>
                {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select allowClear placeholder={<span style={{color: '#666'}}>Thương hiệu</span>} className="white-text-select" onChange={setFilterBrand} style={{ width: '100%' }}>
                {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select allowClear placeholder={<span style={{color: '#666'}}>Trạng thái</span>} className="white-text-select" onChange={setFilterStatus} style={{ width: '100%' }}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            <Col xs={12} md={6}>
              <Button block icon={<FilterOutlined />} style={{ background: '#333', color: '#FFF', border: 'none' }} onClick={() => fetchProducts(1)}>
                LÀM MỚI DỮ LIỆU
              </Button>
            </Col>
          </Row>
        </Card>

        {/* BẢNG SẢN PHẨM */}
        <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, overflow: 'hidden' }}>
          <Table
            loading={loading}
            rowKey="id"
            columns={columns}
            dataSource={products}
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '20px', background: '#0D0D0D', borderRadius: '8px' }}>
                  <Text style={{ color: '#FF6600', fontWeight: 'bold', display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                    <ThunderboltOutlined style={{marginRight: 8}} /> BIẾN THỂ KỸ THUẬT
                  </Text>
                  <Table
                    rowKey="id"
                    size="small"
                    dataSource={record.variants}
                    pagination={false}
                    columns={[
                      { title: <Text style={{color: '#888'}}>PHIÊN BẢN</Text>, dataIndex: "name_variant", render: t => <Text style={{color: '#FFF'}}>{t}</Text> },
                      { title: <Text style={{color: '#888'}}>MÀU</Text>, dataIndex: "color", render: t => <Text style={{color: '#FFF'}}>{t}</Text> },
                      { title: <Text style={{color: '#888'}}>GIÁ</Text>, dataIndex: "price", render: p => <Text style={{color: '#FF6600', fontWeight: '700'}}>{Number(p).toLocaleString()}₫</Text> },
                      { title: <Text style={{color: '#888'}}>KHO</Text>, dataIndex: "stock", render: s => <Tag color={s > 0 ? "#1890FF" : "#FF4D4F"}>{s}</Tag> },
                      {
                        title: <Text style={{color: '#888'}}>THAO TÁC</Text>,
                        render: (_, v) => (
                          <Space>
                            <Button size="small" ghost icon={<EditOutlined style={{color: '#40A9FF'}} />} onClick={() => openEditVariant(v)} />
                            <Button size="small" danger ghost icon={<DeleteOutlined />} onClick={() => removeVariant(v.id)} />
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
              expandIcon: ({ expanded, onExpand, record }) => expanded ? <ControlOutlined style={{ color: '#FF6600' }} onClick={e => onExpand(record, e)} /> : <ControlOutlined style={{ color: '#555' }} onClick={e => onExpand(record, e)} />
            }}
          />
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #222' }}>
            <Pagination current={currentPage} total={totalPages * limit} pageSize={limit} onChange={setCurrentPage} />
          </div>
        </div>

        {/* CSS GLOBAL ĐỂ FIX CHỮ TRẮNG CHO SELECT/INPUT */}
        <style>{`
          .white-text-input input { color: #FFFFFF !important; font-weight: 500; }
          .white-text-select .ant-select-selection-item { color: #FFFFFF !important; font-weight: 500; }
          .white-text-select .ant-select-arrow { color: #FF6600 !important; }
          .ant-select-dropdown { background-color: #1A1A1A !important; border: 1px solid #333 !important; }
          .ant-select-item { color: #FFFFFF !important; }
          .ant-select-item-option-active { background: #FF6600 !important; }
          .ant-select-item-option-selected { background: #444 !important; }
          .ant-table-placeholder { background-color: #141414 !important; }
          .ant-empty-description { color: #666 !important; }
          .ant-pagination-item a { color: #FFF !important; }
          .ant-pagination-item-active { border-color: #FF6600 !important; background: transparent !important; }
          .ant-pagination-item-active a { color: #FF6600 !important; }
          .ant-modal-title { color: #FFFFFF !important; }
          .ant-form-item-label label { color: #E0E0E0 !important; }
        `}</style>

        {/* CÁC MODAL THÊM/SỬA (GIỮ NGUYÊN LOGIC CŨ) */}
        <Modal title={editingProduct ? "CẬP NHẬT SẢN PHẨM" : "TẠO MỚI SẢN PHẨM"} open={showModal} onCancel={() => setShowModal(false)} onOk={handleSaveProduct} width={600} okText="LƯU DỮ LIỆU">
            <Form form={form} layout="vertical" style={{marginTop: 20}}>
                <Form.Item name="name" label="Tên sản phẩm" rules={[{required: true}]}><Input className="white-text-input" /></Form.Item>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="price" label="Giá bán"><InputNumber style={{width: '100%'}} className="white-text-input" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="status" label="Trạng thái"><Select className="white-text-select"><Option value="active">Active</Option><Option value="inactive">Inactive</Option></Select></Form.Item></Col>
                </Row>
                <Form.Item name="image" label="Ảnh sản phẩm"><Upload beforeUpload={()=>false} listType="picture" maxCount={1}><Button block icon={<UploadOutlined />}>Chọn file</Button></Upload></Form.Item>
            </Form>
        </Modal>

        {/* MODAL BIẾN THỂ */}
        <Modal title="QUẢN LÝ BIẾN THỂ" open={showVariantModal} onCancel={() => setShowVariantModal(false)} onOk={saveVariants} width={1000} okText="LƯU TẤT CẢ">
          <Button type="dashed" onClick={addVariant} block icon={<PlusOutlined />} style={{ marginBottom: 16, color: '#FF6600', borderColor: '#FF6600' }}>THÊM DÒNG BIẾN THỂ</Button>
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {variants.map((v, i) => (
              <Card size="small" key={i} style={{ marginBottom: 10, background: '#1A1A1A', border: '1px solid #333' }}>
                <Row gutter={10}>
                  <Col span={6}><Input placeholder="Tên phiên bản" onChange={(e) => (v.name_variant = e.target.value)} /></Col>
                  <Col span={6}><Input placeholder="Màu sắc" onChange={(e) => (v.color = e.target.value)} /></Col>
                  <Col span={6}><InputNumber placeholder="Giá" style={{ width: '100%' }} onChange={(val) => (v.price = val)} /></Col>
                  <Col span={6}><Button danger block icon={<DeleteOutlined />} onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} /></Col>
                </Row>
              </Card>
            ))}
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Products;