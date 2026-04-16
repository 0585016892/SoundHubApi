import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Pagination, Upload, 
  Avatar, Tag, Select, Space, Card, message, Row, Col, 
  Typography, ConfigProvider, theme
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, SearchOutlined, TeamOutlined,
  UserOutlined, MailOutlined, PhoneOutlined
} from "@ant-design/icons";
import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  updateEmployeeStatus
} from "../api/employeeApi";

const { Title, Text } = Typography;

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

  /* ================= FETCH DATA ================= */
  const fetchEmployees = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const data = await getEmployees(page, limit, search);
      setEmployees(data.employees || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch {
      message.error("Lỗi kết nối danh sách nhân sự");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage, keyword);
  }, [currentPage, keyword]);

  /* ================= HANDLERS ================= */
  const handleAdd = () => {
    setIsNew(true);
    setSelectedEmployee(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleEdit = (emp) => {
    setIsNew(false);
    setSelectedEmployee(emp);
    form.setFieldsValue({
        ...emp,
        avatar: null // Reset upload field
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      
      Object.keys(values).forEach((k) => {
        if (values[k] && k !== 'avatar') formData.append(k, values[k]);
      });

      if (values.avatar?.file) {
        formData.append("avatar", values.avatar.file.originFileObj);
      }

      if (isNew) {
        await createEmployee(formData);
        message.success("Đã thêm nhân viên mới");
      } else {
        await updateEmployee(selectedEmployee.id, formData);
        message.success("Cập nhật thông tin thành công");
      }

      setShowModal(false);
      fetchEmployees(currentPage, keyword);
    } catch {
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const handleDelete = async (emp) => {
    if (emp.role === "admin") return message.error("Không thể xóa tài khoản Quản trị viên!");

    Modal.confirm({
      title: <span style={{ color: '#fff' }}>Xác nhận xóa nhân viên?</span>,
      content: <Text style={{ color: '#888' }}>Nhân viên: {emp.full_name}</Text>,
      centered: true,
      okText: 'XÓA',
      okButtonProps: { danger: true, ghost: true },
      onOk: async () => {
        await deleteEmployee(emp.id);
        message.success("Đã xóa nhân viên khỏi hệ thống");
        fetchEmployees(currentPage, keyword);
      },
    });
  };

  const handleStatusChange = async (emp, status) => {
    try {
        await updateEmployeeStatus(emp.id, status);
        message.success("Đã cập nhật trạng thái");
        fetchEmployees(currentPage, keyword);
    } catch {
        message.error("Lỗi cập nhật");
    }
  };
console.log(employees);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: <Text style={{ color: "#888" }}>THÀNH VIÊN</Text>,
      render: (_, record) => (
        <Space>
          {record.avatar ? (
            <Avatar src={`${WEB_URL}/uploads/products/${record.avatar}`} border="1px solid #333" />
          ) : (
            <Avatar icon={<UserOutlined />} style={{ background: '#1a1a1a', color: '#ff6600' }} />
          )}
          <div>
            <Text style={{ color: "#fff", fontWeight: "600", display: 'block' }}>{record.full_name}</Text>
            <Text style={{ color: "#555", fontSize: 11 }}>{record.position || "Staff"}</Text>
          </div>
        </Space>
      ),
    },
    { 
        title: <Text style={{ color: "#888" }}>LIÊN HỆ</Text>, 
        render: (_, r) => (
            <div>
                <Text style={{ color: '#aaa', display: 'block' }}><MailOutlined style={{ fontSize: 10 }} /> {r.email}</Text>
                <Text style={{ color: '#666', fontSize: 12 }}><PhoneOutlined style={{ fontSize: 10 }} /> {r.phone || "N/A"}</Text>
            </div>
        )
    },
    { 
        title: <Text style={{ color: "#888" }}>PHÒNG BAN</Text>, 
        dataIndex: "department",
        render: (d) => <Text style={{ color: '#eee' }}>{d || "—"}</Text>
    },
    {
      title: <Text style={{ color: "#888" }}>VAI TRÒ</Text>,
      dataIndex: "role",
      render: (r) => (r === "admin" ? <Tag color="red" style={{ border: 'none' }}>ADMIN</Tag> : <Tag color="blue" style={{ border: 'none' }}>STAFF</Tag>),
    },
    {
      title: <Text style={{ color: "#888" }}>TRẠNG THÁI</Text>,
      render: (_, e) => (
        <Select
          value={e.status}
          variant="borderless"
          onChange={(v) => handleStatusChange(e, v)}
          style={{ width: 140, background: '#1a1a1a', borderRadius: 4 }}
        >
          <Select.Option value="active"><Text style={{ color: '#52c41a' }}>● Hoạt động</Text></Select.Option>
          <Select.Option value="inactive"><Text style={{ color: '#555' }}>● Tạm ngưng</Text></Select.Option>
        </Select>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THAO TÁC</Text>,
      align: 'center',
      render: (_, e) => (
        <Space>
          <Button ghost icon={<EditOutlined />} style={{ color: '#ff6600', borderColor: '#333' }} onClick={() => handleEdit(e)} />
          <Button danger ghost icon={<DeleteOutlined />} onClick={() => handleDelete(e)} />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorBgContainer: "#141414", colorPrimary: "#ff6600", colorBorder: "#333" }
      }}
    >
      <div style={{ padding: 24, background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER SECTION */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <TeamOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Đội ngũ Nhân sự
            </Title>
            <Text style={{ color: "#555" }}>Quản lý tài khoản nội bộ và phân quyền hệ thống</Text>
          </Col>
          <Col>
            <Space size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
                placeholder="Tìm nhân viên..."
                style={{ width: 280, borderRadius: 20, background: '#141414', border: '1px solid #333' }}
                onChange={(e) => {
                    setKeyword(e.target.value);
                    setCurrentPage(1);
                }}
                allowClear
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ height: 40, borderRadius: 8 }}>
                THÊM NHÂN VIÊN
              </Button>
            </Space>
          </Col>
        </Row>

        {/* TABLE CARD */}
        <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, overflow: 'hidden' }}>
            <Table
                columns={columns}
                dataSource={employees}
                rowKey="id"
                loading={loading}
                pagination={false}
            />
            
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #222' }}>
                <Pagination
                    current={currentPage}
                    total={totalPages * limit}
                    pageSize={limit}
                    onChange={(p) => setCurrentPage(p)}
                    showSizeChanger={false}
                />
            </div>
        </div>

        {/* MODAL FORM */}
        <Modal
            open={showModal}
            onCancel={() => setShowModal(false)}
            onOk={handleSave}
            width={850}
            centered
            okText={isNew ? "TẠO TÀI KHOẢN" : "CẬP NHẬT"}
            cancelText="HỦY"
            title={<Text style={{ color: '#fff', fontSize: 18 }}>{isNew ? "➕ ĐĂNG KÝ NHÂN VIÊN MỚI" : "✏️ CẬP NHẬT THÔNG TIN"}</Text>}
        >
          <Form layout="vertical" form={form} style={{ marginTop: 24 }}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item name="email" label="Email Công vụ" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="email@company.com" disabled={!isNew} />
                </Form.Item>

                {isNew && (
                  <Form.Item name="password" label="Mật khẩu truy cập" rules={[{ required: true }]}>
                    <Input.Password placeholder="••••••••" />
                  </Form.Item>
                )}

                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="phone" label="Điện thoại">
                            <Input placeholder="090..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="role" label="Vai trò" initialValue="staff">
                            <Select dropdownStyle={{ background: '#1a1a1a' }}>
                                <Select.Option value="admin">Quản trị viên (Admin)</Select.Option>
                                <Select.Option value="staff">Nhân viên (Staff)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="department" label="Phòng ban">
                            <Input placeholder="VD: Sales, Marketing..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="position" label="Chức danh">
                            <Input placeholder="VD: Manager, Lead..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ cư trú">
                  <Input.TextArea rows={2} placeholder="Số nhà, tên đường..." />
                </Form.Item>

                <Form.Item name="avatar" label="Ảnh đại diện">
                  <Upload 
                    beforeUpload={() => false} 
                    maxCount={1} 
                    listType="picture-card"
                    className="avatar-uploader"
                  >
                    <div>
                        <PlusOutlined style={{ color: '#ff6600' }} />
                        <div style={{ marginTop: 8, color: '#888' }}>Tải ảnh</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <style>{`
            .ant-table-cell { border-bottom: 1px solid #1a1a1a !important; }
            .ant-pagination-item-active { border-color: #ff6600 !important; }
            .ant-pagination-item-active a { color: #ff6600 !important; }
            .ant-modal-content { border: 1px solid #333 !important; }
            .ant-form-item-label label { color: #888 !important; }
            .avatar-uploader .ant-upload { background: #0a0a0a !important; border: 1px dashed #333 !important; }
            .ant-input:focus, .ant-input-focused { border-color: #ff6600 !important; box-shadow: none !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default EmployeeList;