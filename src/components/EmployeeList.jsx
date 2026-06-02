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
  Row,
  Col,
  Typography,
  ConfigProvider,
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SolutionOutlined,
  LockOutlined,
  HomeOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  updateEmployeeStatus,
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
      toast.error("Lỗi kết nối danh sách nhân sự");
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
      avatar: null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach((k) => {
        if (values[k] && k !== "avatar") formData.append(k, values[k]);
      });

      if (values.avatar?.file) {
        formData.append("avatar", values.avatar.file.originFileObj);
      }

      if (isNew) {
        await createEmployee(formData);
        toast.success("Đã đăng ký tài khoản nhân viên mới");
      } else {
        await updateEmployee(selectedEmployee.id, formData);
        toast.success("Cập nhật hồ sơ nhân sự thành công");
      }

      setShowModal(false);
      fetchEmployees(currentPage, keyword);
    } catch {
      toast.error("Vui lòng kiểm tra lại thông tin biểu mẫu");
    }
  };

  const handleDelete = async (emp) => {
    if (emp.role === "admin")
      return toast.error(
        "Cảnh báo an ninh: Không thể gỡ bỏ tài khoản Quản trị viên tối cao!",
      );

    Modal.confirm({
      title: (
        <span className="modal-danger-title">⚠️ THU HỒI HỒ SƠ NHÂN SỰ</span>
      ),
      content: (
        <div style={{ marginTop: 10 }}>
          <Text style={{ color: "#aaa" }}>
            Hệ thống sẽ tiến hành xóa vĩnh viễn quyền truy cập của nhân
            viên:{" "}
          </Text>
          <strong
            style={{
              color: "#fff",
              display: "block",
              marginTop: 5,
              fontSize: 14,
            }}
          >
            {emp.full_name}
          </strong>
        </div>
      ),
      centered: true,
      okText: "XÓA VĨNH VIỄN",
      cancelText: "QUAY LẠI",
      okButtonProps: { danger: true, className: "btn-modal-danger-ok" },
      cancelButtonProps: { className: "btn-modal-danger-cancel" },
      onOk: async () => {
        await deleteEmployee(emp.id);
        toast.success("Đã gỡ tài khoản khỏi danh bạ nội bộ");
        fetchEmployees(currentPage, keyword);
      },
    });
  };

  const handleStatusChange = async (emp, status) => {
    try {
      await updateEmployeeStatus(emp.id, status);
      toast.success("Cập nhật trạng thái phân quyền thành công");
      fetchEmployees(currentPage, keyword);
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "DANH TÍNH THÀNH VIÊN",
      render: (_, record) => (
        <Space size="middle" className="customer-profile-cell">
          <div className="avatar-glow-wrapper">
            {record.avatar ? (
              <Avatar
                src={`${WEB_URL}/uploads/products/${record.avatar}`}
                size={36}
              />
            ) : (
              <Avatar
                icon={<UserOutlined />}
                size={36}
                style={{ background: "#161616", color: "#ff5302" }}
              />
            )}
          </div>
          <div>
            <span className="c-name-main">{record.full_name}</span>
            <span className="c-id-sub">
              {record.position || "Staff Position"}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "THÔNG TIN LIÊN LẠC",
      render: (_, r) => (
        <div className="contact-cell">
          <span className="email-txt">
            <MailOutlined /> {r.email}
          </span>
          <span className="phone-txt">
            <PhoneOutlined /> {r.phone || "---"}
          </span>
        </div>
      ),
    },
    {
      title: "PHÒNG BAN",
      dataIndex: "department",
      render: (d) => (
        <span className="department-text">{d || "Chưa phân bổ"}</span>
      ),
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      width: 130,
      render: (r) =>
        r === "admin" ? (
          <Tag color="red" bordered={false} className="role-tag admin">
            ADMIN
          </Tag>
        ) : (
          <Tag color="blue" bordered={false} className="role-tag staff">
            STAFF
          </Tag>
        ),
    },
    {
      title: "TRẠNG THÁI",
      width: 180,
      render: (_, e) => (
        <Select
          value={e.status}
          bordered={false}
          className="neo-select-status"
          dropdownClassName="neo-select-dropdown"
          onChange={(v) => handleStatusChange(e, v)}
        >
          <Select.Option value="active">
            <span className="status-dot active">●</span> HOẠT ĐỘNG
          </Select.Option>
          <Select.Option value="inactive">
            <span className="status-dot inactive">●</span> TẠM NGƯNG
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "BẢNG ĐIỀU KHIỂN",
      align: "center",
      width: 140,
      render: (_, e) => (
        <Space size="middle">
          <Button
            type="text"
            className="btn-action-view"
            icon={<EditOutlined />}
            onClick={() => handleEdit(e)}
          />
          <Button
            type="text"
            danger
            className="btn-action-delete"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(e)}
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
          colorText: "#e5e5e5",
          colorPrimary: "#ff5302",
          colorBorder: "#222222",
        },
      }}
    >
      <div className="admin-bento-layout">
        {/* HEADER CONTROLS BAR */}
        <div className="filter-bento-bar mb-4">
          <Row gutter={[24, 16]} justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <div className="page-headline-block">
                <Title level={2} className="m-0 page-main-title">
                  <TeamOutlined className="title-icon" /> Quản Lý Nhân Sự
                </Title>
                <Text className="text-muted letter-spacing-1">
                  Hệ thống quản lý định danh tài khoản nội bộ, cấu hình phòng
                  ban và phân quyền lớp bảo mật
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12} className="text-end">
              <Space size="middle" className="mobile-full-width-space">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tra cứu tên, email nhân sự..."
                  className="neo-search-input"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="btn-neo-primary"
                >
                  THÊM NHÂN VIÊN
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* DATA CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="table-bento-container"
        >
          <Table
            columns={columns}
            dataSource={employees}
            rowKey="id"
            loading={loading}
            className="custom-neo-table"
            pagination={false}
          />

          {/* CUSTOM NEO PAGINATION COMPONENT */}
          <div className="neo-pagination-wrapper">
            <Pagination
              current={currentPage}
              total={totalPages * limit}
              pageSize={limit}
              onChange={(p) => setCurrentPage(p)}
              showSizeChanger={false}
            />
          </div>
        </motion.div>

        {/* MODERN MULTI-COLUMN FORM MODAL */}
        <Modal
          open={showModal}
          onCancel={() => setShowModal(false)}
          onOk={handleSave}
          width={900}
          centered
          className="neo-form-modal"
          okText={isNew ? "KHỞI TẠO TÀI KHOẢN" : "CẬP NHẬT HỒ SƠ"}
          cancelText="HỦY LỆNH"
          title={
            <div className="form-modal-header-title">
              {isNew
                ? "Đăng ký thành viên nội bộ mới"
                : "Cấu hình lại thông tin hồ sơ"}
            </div>
          }
        >
          <Form layout="vertical" form={form} className="neo-form-container">
            <Row gutter={24}>
              {/* CỘT TRÁI: ĐỊNH DANH TÀI KHOẢN */}
              <Col span={12} className="form-split-col border-right">
                <div className="form-sub-section-title">
                  <SolutionOutlined /> DANH TÍNH CƠ BẢN
                </div>
                <Form.Item
                  name="full_name"
                  label="Họ và tên nhân sự"
                  rules={[{ required: true, message: "Nhập họ tên" }]}
                >
                  <Input
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="neo-form-input"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Hòm thư công vụ (Email)"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Nhập đúng cấu trúc email",
                    },
                  ]}
                >
                  <Input
                    placeholder="name@company.com"
                    disabled={!isNew}
                    className="neo-form-input"
                  />
                </Form.Item>

                {isNew && (
                  <Form.Item
                    name="password"
                    label="Mật khẩu khởi tạo truy cập"
                    rules={[{ required: true, message: "Thiết lập mật khẩu" }]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      className="neo-form-input password-input"
                    />
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="phone" label="Hotline di động">
                      <Input
                        placeholder="090XXXXXXXX"
                        className="neo-form-input"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="role"
                      label="Phân cấp hệ thống"
                      initialValue="staff"
                    >
                      <Select
                        popupClassName="neo-select-dropdown"
                        className="neo-form-select"
                      >
                        <Select.Option value="admin">
                          Quản trị viên (Admin)
                        </Select.Option>
                        <Select.Option value="staff">
                          Nhân viên (Staff)
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              {/* CỘT PHẢI: VỊ TRÍ CÔNG TÁC & AVATAR */}
              <Col span={12} className="form-split-col">
                <div className="form-sub-section-title">
                  <DeploymentUnitOutlined /> SƠ ĐỒ TỔ CHỨC
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="department" label="Phòng ban điều hành">
                      <Input
                        placeholder="VD: Sales, R&D..."
                        className="neo-form-input"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="position" label="Chức danh đảm nhiệm">
                      <Input
                        placeholder="VD: Manager, Specialist..."
                        className="neo-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ cư trú tạm trú">
                  <Input.TextArea
                    rows={2}
                    placeholder="Khu vực thành phố, số nhà..."
                    className="neo-form-textarea"
                  />
                </Form.Item>

                <Form.Item
                  name="avatar"
                  label="Hồ sơ ảnh đại diện (Định dạng vuông)"
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture-card"
                    className="avatar-neo-uploader"
                  >
                    <div>
                      <PlusOutlined className="upload-plus-icon" />
                      <div className="upload-txt">UP DATA</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <style>{`
          .admin-bento-layout { padding: 30px; background: #080808; min-height: 100vh; color: #e5e5e5; font-family: 'Inter', sans-serif; }
          .page-main-title { font-weight: 900 !important; letter-spacing: -1px; color: #fff !important; display: flex; align-items: center; }
          .title-icon { color: #ff5302; margin-right: 12px; }
          .letter-spacing-1 { letter-spacing: 0.5px; font-size: 11px; font-weight: 700; color: #ffff !important; display: block; margin-top: 4px; }

          /* Filter Bar */
          .filter-bento-bar { background: #111; border: 1px solid #222; border-radius: 16px; padding: 20px; }
          .neo-search-input { background: #161616 !important; border: 1px solid #262626 !important; border-radius: 10px !important; padding: 10px 14px !important; color: #fff !important; width: 280px; }
          .neo-search-input .anticon { color: #ff5302 !important; }
          .btn-neo-primary { background: #ff5302 !important; border: none !important; font-weight: 800 !important; border-radius: 10px !important; height: 44px !important; padding: 0 20px !important; letter-spacing: 0.5px; }
          .btn-neo-primary:hover { background: #ff661d !important; }

          /* Table Bento Container */
          .table-bento-container { background: #111; border: 1px solid #222; border-radius: 20px; overflow: hidden; }
          .custom-neo-table .ant-table { background: transparent !important; }
          .custom-neo-table .ant-table-thead > tr > th { font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.5px; border-bottom: 1px solid #222 !important; padding: 18px 20px !important; color: #fff !important; background: #161616 !important; }
          .custom-neo-table .ant-table-tbody > tr > td { border-bottom: 1px solid #1a1a1a !important; padding: 16px 20px !important; }

          /* Forcing Core Cell Contents to Pure White (#ffffff) */
          .c-name-main { font-weight: 700; color: #ffffff !important; font-size: 14px; display: block; }
          .c-id-sub { font-size: 11px; color: #ff5302; font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
          
          .contact-cell .email-txt { display: block; color: #ffffff !important; font-weight: 600; font-size: 13px; }
          .contact-cell .phone-txt { display: block; color: #888; font-size: 11px; margin-top: 2px; font-weight: 700; }
          .contact-cell .anticon { margin-right: 4px; color: #ffff; }

          .department-text { color: #ffffff !important; font-weight: 600; font-size: 13px; }

          /* Role and Status Select Design */
          .role-tag { font-weight: 800; font-size: 10px; padding: 3px 10px; border-radius: 5px; margin: 0; }
          .role-tag.admin { background: rgba(239, 68, 68, 0.1); color: #efffff4; }
          .role-tag.staff { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

          .neo-select-status { background: #161616; border: 1px solid #262626; border-radius: 8px; width: 145px; }
          .neo-select-status .ant-select-selection-item { font-weight: 800 !important; font-size: 11px !important; color: #ffffff !important; }
          .status-dot { margin-right: 6px; }
          .status-dot.active { color: #22c55e; }
          .status-dot.inactive { color: #fff; }

          .btn-action-view { background: #161616 !important; color: #ff5302 !important; border-radius: 8px; }
          .btn-action-view:hover { background: rgba(255, 83, 2, 0.1) !important; }
          .btn-action-delete { background: #161616 !important; color: #efffff4 !important; border-radius: 8px; }
          .btn-action-delete:hover { background: rgba(239, 68, 68, 0.1) !important; }

          /* Pagination custom footer */
          .neo-pagination-wrapper { padding: 18px 20px; display: flex; justify-content: flex-end; border-top: 1px solid #161616; background: #131313; }
          .ant-pagination-item { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; }
          .ant-pagination-item a { color: #fff !important; font-weight: 700; }
          .ant-pagination-item-active { border-color: #ff5302 !important; }
          .ant-pagination-item-active a { color: #ff5302 !important; }
          .ant-pagination-prev .ant-pagination-item-link, .ant-pagination-next .ant-pagination-item-link { background: #161616 !important; border-color: #262626 !important; border-radius: 8px; color: #fff !important; }

          /* Multi-column Form Modal Styling */
          .neo-form-modal .ant-modal-content { background: #0e0e0e !important; border: 1px solid #222 !important; border-radius: 24px !important; padding: 30px !important; }
          .form-modal-header-title { color: #ffffff !important; font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; }
          .neo-form-container { margin-top: 25px; }
          .form-split-col.border-right { border-right: 1px solid #1a1a1a; padding-right: 24px; }
          .form-sub-section-title { font-size: 10px; font-weight: 900; color: #ffff; letter-spacing: 1px; margin-bottom: 20px; display: flex; align-items: center; gap: 6px; }
          
          /* Form Inputs layout */
          .ant-form-item { margin-bottom: 16px !important; }
          .ant-form-item-label label { color: #fff !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase; }
          .neo-form-input, .neo-form-select .ant-select-selector, .neo-form-textarea { background: #141414 !important; border: 1px solid #222 !important; border-radius: 10px !important; color: #ffffff !important; width: 100% !important; padding: 8px 12px !important; }
          .neo-form-select .ant-select-selector { padding: 4px 12px !important; height: 42px !important; }
          .neo-form-textarea { padding: 12px !important; }
          
          /* Input / Select Text control overrides */
          .ant-input-input, .ant-select-selection-item, .ant-input-password input { color: #ffffff !important; font-weight: 600; }
          .ant-input::placeholder { color: #ffff !important; }
          
          /* Password specific background fix */
          .password-input { padding: 0 !important; overflow: hidden; background: #141414 !important; display: flex; align-items: center; }
          .password-input input { background: transparent !important; padding: 8px 12px !important; height: 100%; border: none !important; }
          .password-input .ant-input-suffix { padding-right: 12px; }

          /* Custom Avatar Uploader Box */
          .avatar-neo-uploader .ant-upload-list-item-container, .avatar-neo-uploader .ant-upload-select { width: 100px !important; height: 100px !important; border-radius: 12px !important; margin: 0 !important; }
          .avatar-neo-uploader .ant-upload-select { background: #141414 !important; border: 1px dashed #222 !important; }
          .avatar-neo-uploader .ant-upload-select:hover { border-color: #ff5302 !important; }
          .upload-plus-icon { color: #ff5302; font-size: 18px; }
          .upload-txt { margin-top: 4px; font-weight: 900; color: #ffff; font-size: 9px; letter-spacing: 0.5px; }

          /* Select Popups override */
          .neo-select-dropdown { background: #141414 !important; border: 1px solid #222 !important; border-radius: 10px !important; padding: 6px !important; }
          .neo-select-dropdown .ant-select-item { color: #aaa !important; font-weight: 600; border-radius: 6px; }
          .neo-select-dropdown .ant-select-item-option-selected { background: #222 !important; color: #fff !important; }

          /* Action modals system overrides */
          .modal-danger-title { color: #efffff4; font-weight: 900; }
          .btn-modal-danger-ok { background: #efffff4 !important; font-weight: 700; border-radius: 8px; border: none !important; color: white !important; }
          .btn-modal-danger-cancel { background: #161616 !important; border-color: #262626 !important; color: #fff !important; font-weight: 700; border-radius: 8px; }
          .ant-modal-confirm-body .ant-modal-confirm-content { margin-top: 8px !important; }

          /* Focus Box outlines */
          .ant-input:focus, .ant-input-focused, .ant-select:focus, .ant-select-focused, .ant-input-password-focused { border-color: #ff5302 !important; box-shadow: none !important; }
          
          @media (max-width: 768px) {
            .neo-search-input { width: 100%; }
            .mobile-full-width-space { width: 100%; justify-content: space-between; }
            .form-split-col.border-right { border-right: none; padding-right: 0; margin-bottom: 20px; }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default EmployeeList;
