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
  Spin,
  Pagination,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getBrands1,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../api/brandApi";

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

  /* SLUG */
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

  /* LOAD DATA */
  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands1(page, 8, search);
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

  /* OPEN MODAL */
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

  /* SUBMIT */
  const onFinish = async (values) => {
    const fd = new FormData();
    Object.keys(values).forEach((key) => {
      if (key !== "logo") fd.append(key, values[key]);
    });

    if (values.logo?.file) fd.append("logo", values.logo.file);

    try {
      if (editBrand) {
        await updateBrand(editBrand.id, fd);
        toast.success("Cập nhật thành công");
      } else {
        await createBrand(fd);
        toast.success("Thêm thương hiệu thành công");
      }
      setOpenModal(false);
      loadBrands();
    } catch {
      toast.error("Lỗi khi lưu");
    }
  };

  /* DELETE */
  const handleDelete = (brand) => {
    Modal.confirm({
      title: "Xóa thương hiệu?",
      content: `Bạn chắc chắn muốn xóa ${brand.name}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        await deleteBrand(brand.id);
        toast.success("Đã xóa");
        loadBrands();
      },
    });
  };

  /* TABLE COLUMNS */
  const columns = [
    {
      title: "#",
      render: (_, __, i) => (page - 1) * 8 + i + 1,
    },
    {
      title: "Logo",
      dataIndex: "logo",
      render: (logo) => (
        <Image
          width={60}
          src={`${WEB_URL}/uploads/products/${logo}`}
          style={{ borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Xuất xứ",
      dataIndex: "origin",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (d) => (d?.length > 40 ? d.slice(0, 40) + "..." : d),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) =>
        s === "active" ? <Tag color="green">Hoạt động</Tag> : <Tag>Ngừng</Tag>,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>🎧 Quản lý thương hiệu Loa</h2>

      {/* SEARCH + ADD */}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm thương hiệu
        </Button>

        <Input.Search
          placeholder="Tìm thương hiệu..."
          allowClear
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          style={{ width: 300 }}
        />
      </Space>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
      />

      <Pagination
        current={page}
        total={totalPages * 10}
        pageSize={10}
        onChange={(p) => setPage(p)}
        style={{ marginTop: 20, textAlign: "right" }}
      />

      {/* MODAL ADD / EDIT */}
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title={editBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true }]}>
            <Input
              onChange={(e) =>
                form.setFieldsValue({
                  slug: slugify(e.target.value),
                })
              }
            />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input />
          </Form.Item>

          <Form.Item name="origin" label="Xuất xứ">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="active">
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Ngừng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="logo" label="Logo">
            <Upload beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Upload Logo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandPage;
