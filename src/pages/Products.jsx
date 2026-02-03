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
  Collapse,
  Pagination,
  Spin,
  Row,
  Col,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  updateVariants,
  deleteVariant,
  editVariant,
} from "../api/productApi";
import { getBrands } from "../api/brandApi";
import { getCategories } from "../api/categoryApi";
import { getCoupons } from "../api/couponApi";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Option } = Select;

const Products = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const navigate = useNavigate();
  const limit = 10;

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // FILTER
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // MODAL PRODUCT
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // MODAL VARIANT ADD
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variants, setVariants] = useState([]);

  // MODAL VARIANT EDIT
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm] = Form.useForm();

  useEffect(() => {
    fetchProducts(currentPage);
    fetchOptions();
  }, [currentPage]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    const b = await getBrands();
    const c = await getCategories();
    const cp = await getCoupons();
    setBrands(b.data);
    setCategories(c.data);
    setCoupons(cp.data);
  };

  // ================= PRODUCT =================
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm?")) return;
    await deleteProduct(id);
    fetchProducts(currentPage);
  };

  const handleSaveProduct = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    Object.keys(values).forEach((k) => formData.append(k, values[k]));

    if (values.image?.file) formData.append("image", values.image.file);

    if (editingProduct) await updateProduct(editingProduct.id, formData);
    else await createProduct(formData);

    setShowModal(false);
    fetchProducts(currentPage);
  };

  // ================= VARIANT =================
  const openVariantModal = (product) => {
    setEditingProduct(product);
    setVariants([]);
    setShowVariantModal(true);
  };

  const addVariant = () => {
    setVariants([...variants, {}]);
  };

  const saveVariants = async () => {
    await updateVariants(editingProduct.id, variants);
    setShowVariantModal(false);
    fetchProducts(currentPage);
  };

  const openEditVariant = (variant) => {
    setEditingVariant(variant);
    variantForm.setFieldsValue(variant);
    setShowEditVariantModal(true);
  };

  const saveEditVariant = async () => {
    const values = await variantForm.validateFields();
    await editVariant(editingVariant.id, values);
    setShowEditVariantModal(false);
    fetchProducts(currentPage);
  };

  const removeVariant = async (id) => {
    if (!window.confirm("Xóa biến thể?")) return;
    await deleteVariant(id);
    fetchProducts(currentPage);
  };

  // ================= TABLE =================
  const columns = [
    {
      title: "#",
      render: (_, __, i) => i + 1 + (currentPage - 1) * limit,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (img) =>
        img ? (
          <Image width={60} src={`${WEB_URL}/uploads/products/${img}`} />
        ) : (
          "No image"
        ),
    },
    { title: "Tên", dataIndex: "name" },
    {
      title: "Giá",
      dataIndex: "price",
      render: (p) => Number(p).toLocaleString() + "₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) =>
        s === "active" ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    { title: "Brand", dataIndex: "brand_name" },
    { title: "Category", dataIndex: "category_name" },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/productDetail/${record.id}`)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<PlusOutlined />} onClick={() => openVariantModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách sản phẩm</h2>

      {/* FILTER */}
      <Row gutter={10} style={{ marginBottom: 10 }}>
        <Col span={6}>
          <Input placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
        </Col>
        <Col span={4}>
          <Select allowClear placeholder="Category" onChange={setFilterCategory} style={{ width: "100%" }}>
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select allowClear placeholder="Brand" onChange={setFilterBrand} style={{ width: "100%" }}>
            {brands.map((b) => (
              <Option key={b.id} value={b.id}>
                {b.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select allowClear placeholder="Status" onChange={setFilterStatus} style={{ width: "100%" }}>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Col>
        <Col span={3}>
          <Button type="primary" onClick={() => fetchProducts(1)}>
            Lọc
          </Button>
        </Col>
      </Row>

      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Thêm sản phẩm
      </Button>

      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          expandable={{
            expandedRowRender: (record) => (
              <Collapse>
                <Panel header="Biến thể">
                  <Table
                    rowKey="id"
                    size="small"
                    dataSource={record.variants}
                    columns={[
                      { title: "Tên", dataIndex: "name_variant" },
                      { title: "Màu", dataIndex: "color" },
                      { title: "Power", dataIndex: "power" },
                      { title: "Kết nối", dataIndex: "connection_type" },
                      { title: "Giá", dataIndex: "price" },
                      { title: "Stock", dataIndex: "stock" },
                      {
                        title: "Action",
                        render: (_, v) => (
                          <Space>
                            <Button icon={<EditOutlined />} onClick={() => openEditVariant(v)} />
                            <Button danger icon={<DeleteOutlined />} onClick={() => removeVariant(v.id)} />
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Panel>
              </Collapse>
            ),
          }}
          pagination={false}
        />
      )}

      <Pagination
        current={currentPage}
        total={totalPages * limit}
        pageSize={limit}
        onChange={setCurrentPage}
        style={{ marginTop: 10 }}
      />

      {/* MODAL PRODUCT */}
      <Modal open={showModal} onCancel={() => setShowModal(false)} onOk={handleSaveProduct}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item name="brand_id" label="Brand">
            <Select allowClear>
              {brands.map((b) => (
                <Option key={b.id} value={b.id}>
                  {b.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="category_id" label="Category">
            <Select allowClear>
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="image" label="Ảnh">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL ADD VARIANTS */}
      <Modal
        open={showVariantModal}
        onCancel={() => setShowVariantModal(false)}
        onOk={saveVariants}
        width={900}
      >
        <Button onClick={addVariant}>+ Add Variant</Button>
        {variants.map((v, i) => (
          <Row key={i} gutter={10}>
            <Col span={4}>
              <Input placeholder="Tên" onChange={(e) => (v.name_variant = e.target.value)} />
            </Col>
            <Col span={4}>
              <Input placeholder="Màu" onChange={(e) => (v.color = e.target.value)} />
            </Col>
            <Col span={4}>
              <Input placeholder="Power" onChange={(e) => (v.power = e.target.value)} />
            </Col>
            <Col span={4}>
              <InputNumber placeholder="Giá" onChange={(val) => (v.price = val)} />
            </Col>
          </Row>
        ))}
      </Modal>

      {/* MODAL EDIT VARIANT */}
      <Modal open={showEditVariantModal} onCancel={() => setShowEditVariantModal(false)} onOk={saveEditVariant}>
        <Form form={variantForm} layout="vertical">
          <Form.Item name="name_variant" label="Tên">
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Màu">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="stock" label="Stock">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
