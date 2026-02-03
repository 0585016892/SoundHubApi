import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Pagination,
  Upload,
  Avatar,
  Tag,
  Select,
  Space,
  Card,
  message,
  Row,Col
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  updateEmployeeStatus
} from "../api/employeeApi";

const EmployeeList = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form] = Form.useForm();
  const limit = 5;

  // ===== FETCH DATA =====
  const fetchEmployees = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const data = await getEmployees(page, limit, search);
      setEmployees(data.employees);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage, keyword);
  }, [currentPage, keyword]);

  // ===== ADD =====
  const handleAdd = () => {
    setIsNew(true);
    setSelectedEmployee(null);
    form.resetFields();
    setShowModal(true);
  };

  // ===== EDIT =====
  const handleEdit = (emp) => {
    setIsNew(false);
    setSelectedEmployee(emp);
    form.setFieldsValue(emp);
    setShowModal(true);
  };

  // ===== SAVE =====
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      Object.keys(values).forEach((k) => {
        if (values[k]) formData.append(k, values[k]);
      });

      if (values.avatar?.file) {
        formData.append("avatar", values.avatar.file.originFileObj);
      }

      if (isNew) {
        await createEmployee(formData);
        message.success("Thêm nhân viên thành công");
      } else {
        await updateEmployee(selectedEmployee.id, formData);
        message.success("Cập nhật nhân viên thành công");
      }

      setShowModal(false);
      fetchEmployees(currentPage, keyword);
    } catch {}
  };

  // ===== DELETE =====
  const handleDelete = async (emp) => {
    if (emp.role === "admin") return message.error("Không thể xóa Admin!");

    Modal.confirm({
      title: "Xác nhận xóa nhân viên?",
      content: emp.full_name,
      onOk: async () => {
        await deleteEmployee(emp.id);
        message.success("Đã xóa nhân viên");
        fetchEmployees(currentPage, keyword);
      },
    });
  };

  // ===== STATUS CHANGE =====
  const handleStatusChange = async (emp, status) => {
    await updateEmployeeStatus(emp.id, status);
    message.success("Cập nhật trạng thái thành công");
    fetchEmployees(currentPage, keyword);
  };

  // ===== TABLE COLUMNS =====
  const columns = [
    { title: "#", render: (_, __, i) => i + 1 + (currentPage - 1) * limit },
    { title: "Họ tên", dataIndex: "full_name" },
    { title: "Email", dataIndex: "email" },
    { title: "Điện thoại", dataIndex: "phone" },
    { title: "Chức vụ", dataIndex: "position" },
    { title: "Phòng ban", dataIndex: "department" },
    { title: "Địa chỉ", dataIndex: "address" },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (r) => (r === "admin" ? <Tag color="red">Admin</Tag> : <Tag color="blue">Staff</Tag>),
    },
    {
      title: "Avatar",
      dataIndex: "avatar",
      render: (a) =>
        a ? <Avatar src={`${WEB_URL}/uploads/products/${a}`} /> : <Avatar>U</Avatar>,
    },
    {
      title: "Trạng thái",
      render: (_, e) => (
        <Select
          value={e.status}
          onChange={(v) => handleStatusChange(e, v)}
          style={{ width: 120 }}
        >
          <Select.Option value="active">Hoạt động</Select.Option>
          <Select.Option value="inactive">Không hoạt động</Select.Option>
        </Select>
      ),
    },
    {
      title: "Hành động",
      render: (_, e) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(e)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(e)} />
        </Space>
      ),
    },
  ];

  return (
    <Card title="👨‍💼 Quản lý nhân viên" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm nhân viên</Button>}>
      
      {/* SEARCH */}
      <Input.Search
        placeholder="Tìm theo tên hoặc email..."
        style={{ width: 300, marginBottom: 16 }}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages * limit}
          pageSize={limit}
          onChange={(p) => setCurrentPage(p)}
          style={{ marginTop: 16, textAlign: "right" }}
        />
      )}

      {/* MODAL ADD / EDIT */}
    <Modal
  open={showModal}
  onCancel={() => setShowModal(false)}
  onOk={handleSave}
  width={900}
  centered
>
  <h3 style={{ marginBottom: 20 }}>
    {isNew ? "Thêm nhân viên" : "Sửa nhân viên"}
  </h3>

  <Form layout="vertical" form={form}>
    <Row gutter={16}>
      {/* Cột trái */}
      <Col span={12}>
        <Form.Item name="full_name" label="Họ tên" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {isNew && (
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item name="phone" label="Điện thoại">
          <Input />
        </Form.Item>

        <Form.Item name="position" label="Chức vụ">
          <Input />
        </Form.Item>
      </Col>

      {/* Cột phải */}
      <Col span={12}>
        <Form.Item name="department" label="Phòng ban">
          <Input />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item name="role" label="Vai trò">
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="staff">Staff</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="avatar" label="Avatar">
          <Upload beforeUpload={() => false} maxCount={1} listType="picture-card">
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
      </Col>
    </Row>
  </Form>
</Modal>

    </Card>
  );
};

export default EmployeeList;
