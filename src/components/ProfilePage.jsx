import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Row,
  Col,
  Spin,
  Typography,
  Space,
  Divider,
  ConfigProvider,
  theme,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SlidersOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { updateProfile } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo2.png";

const { Title, Text, Paragraph } = Typography;

const ProfilePage = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [activeBentoTab, setActiveBentoTab] = useState("profile");

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile(user.id, profile);
      toast.success("Hồ sơ nhân sự đã được đồng bộ!");
    } catch (err) {
      toast.error("Đồng bộ thất bại, vui lòng kiểm tra kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user)
    return (
      <div className="profile-studio-loader">
        <Spin size="large" />
        <Text className="loader-studio-txt">
          ĐANG TRUY XUẤT CHỨNG THƯ KỸ THUẬT SỐ...
        </Text>
      </div>
    );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#ff6600",
          colorBgContainer: "#111111",
          colorText: "#ffffff",
          colorBorder: "#161616",
        },
      }}
    >
      <div className="studio-profile-container">
        <Row
          gutter={[24, 24]}
          justify="center"
          className="profile-max-viewport"
        >
          {/* CỘT TRÁI: THÀNH PHẦN ĐỊNH DANH DANH TÍNH (IDENTITY CARD) */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              {/* Thẻ Thực Thể Gốc */}
              <Card
                bordered={false}
                className="bento-profile-card center-identity"
              >
                <div className="avatar-secure-viewport">
                  <div className="avatar-pulse-glow">
                    <Avatar
                      size={130}
                      src={
                        profile.avatar
                          ? `${WEB_URL}/uploads/products/${profile.avatar}`
                          : logo
                      }
                      className="avatar-core-lens"
                    />
                    <Button
                      shape="circle"
                      icon={<CameraOutlined />}
                      className="btn-trigger-lens-upload"
                    />
                  </div>
                </div>

                <Title level={3} className="identity-user-name">
                  {profile.full_name?.toUpperCase() || "CHUYÊN VIÊN SOUNDHUB"}
                </Title>
                <span className="identity-user-slug">
                  CORE_NODE_ID // 00{user.id}
                </span>

                <div className="status-indicator-strip">
                  <span className="pulse-signal-dot" /> ENGINE ONLINE
                </div>

                <Divider className="studio-divider-dark" />

                {/* Danh mục chuyển đổi Bento Tab (Thay thế Tabs mặc định) */}
                <div className="bento-navigation-vertical">
                  <div
                    className={`bento-nav-item-block ${activeBentoTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveBentoTab("profile")}
                  >
                    <UserOutlined className="nav-item-icon" />
                    <div className="nav-item-meta">
                      <span className="nav-item-title">HỒ SƠ CỐT LÕI</span>
                      <span className="nav-item-desc">
                        Thông tin định danh phân hệ
                      </span>
                    </div>
                  </div>

                  <div
                    className={`bento-nav-item-block ${activeBentoTab === "password" ? "active" : ""}`}
                    onClick={() => setActiveBentoTab("password")}
                  >
                    <LockOutlined className="nav-item-icon" />
                    <div className="nav-item-meta">
                      <span className="nav-item-title">MÃ KHÓA TRUY CẬP</span>
                      <span className="nav-item-desc">
                        Thay đổi mã bảo mật Token
                      </span>
                    </div>
                  </div>

                  <div
                    className={`bento-nav-item-block ${activeBentoTab === "preferences" ? "active" : ""}`}
                    onClick={() => setActiveBentoTab("preferences")}
                  >
                    <SettingOutlined className="nav-item-icon" />
                    <div className="nav-item-meta">
                      <span className="nav-item-title">CẤU HÌNH ENGINE</span>
                      <span className="nav-item-desc">
                        Tùy biến không gian phân phối
                      </span>
                    </div>
                  </div>
                </div>

                <Divider className="studio-divider-dark" />

                <Button
                  block
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  className="btn-studio-disconnect"
                >
                  NGẮT KẾT NỐI HỆ THỐNG
                </Button>
              </Card>
            </Space>
          </Col>

          {/* CỘT PHẢI: PHÂN KHU ĐIỀU KHIỂN & BIỂU MẪU SỐ LIỆU */}
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              className="bento-profile-card content-workspace-card"
            >
              {/* TOÀN BỘ LOGIC RENDER THEO BENTO TAB SELECTOR */}
              {activeBentoTab === "profile" && (
                <div className="bento-subview-panel animate-fade-in">
                  <div className="subview-header">
                    <InfoCircleOutlined className="subview-header-icon" />
                    <div>
                      <Title level={4} className="subview-main-title">
                        THÔNG TIN ĐỊNH DANH NHÂN SỰ
                      </Title>
                      <Text className="subview-sub-desc">
                        Cấu hình trường dữ liệu nền tảng của tài khoản phân hệ.
                      </Text>
                    </div>
                  </div>

                  <Form
                    layout="vertical"
                    requiredMark={false}
                    className="studio-form-sleek"
                  >
                    <Row gutter={20}>
                      <Col xs={24} md={12}>
                        <Form.Item label="HỌ VÀ TÊN CHUYÊN VIÊN">
                          <Input
                            size="large"
                            prefix={<UserOutlined />}
                            value={profile.full_name}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                full_name: e.target.value,
                              })
                            }
                            className="studio-input-core"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="ĐƯỜNG DÂY LIÊN HỆ (PHONE)">
                          <Input
                            size="large"
                            prefix={<PhoneOutlined />}
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            className="studio-input-core"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="ĐỊA CHỈ EMAIL ROOT (CỐ ĐỊNH)">
                      <Input
                        size="large"
                        prefix={<MailOutlined />}
                        value={profile.email}
                        disabled
                        className="studio-input-core input-disabled-spec"
                      />
                    </Form.Item>

                    <div className="form-bento-notice-bar">
                      <SafetyCertificateOutlined className="notice-icon" />
                      <span className="notice-text">
                        Tài khoản này được bảo mật mã hóa mức cao. Mọi hành vi
                        thay đổi thông tin đều được ghi lại vào log quản trị
                        core.
                      </span>
                    </div>

                    <Divider
                      className="studio-divider-dark"
                      style={{ margin: "24px 0" }}
                    />

                    <Button
                      type="primary"
                      size="large"
                      loading={loading}
                      onClick={handleProfileUpdate}
                      className="btn-studio-save-action"
                    >
                      ĐỒNG BỘ THAY ĐỔI
                    </Button>
                  </Form>
                </div>
              )}

              {activeBentoTab === "password" && (
                <div className="bento-subview-panel animate-fade-in">
                  <div className="subview-header">
                    <SafetyCertificateOutlined className="subview-header-icon" />
                    <div>
                      <Title level={4} className="subview-main-title">
                        MÃ KHÓA BẢO MẬT HỆ THỐNG
                      </Title>
                      <Text className="subview-sub-desc">
                        Định cấu hình lại Token chuỗi ký tự mật mã để tăng cường
                        bảo mật.
                      </Text>
                    </div>
                  </div>

                  <Form layout="vertical" className="studio-form-sleek">
                    <Form.Item label="MẬT MÃ TRUY CẬP HIỆN TẠI">
                      <Input.Password
                        size="large"
                        className="studio-input-core"
                      />
                    </Form.Item>

                    <Row gutter={20}>
                      <Col xs={24} md={12}>
                        <Form.Item label="MẬT MÃ ĐỔI MỚI RE-KEY">
                          <Input.Password
                            size="large"
                            className="studio-input-core"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="XÁC NHẬN CHUỖI MẬT MÃ">
                          <Input.Password
                            size="large"
                            className="studio-input-core"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider
                      className="studio-divider-dark"
                      style={{ margin: "24px 0" }}
                    />

                    <Button
                      type="primary"
                      size="large"
                      className="btn-studio-save-action"
                    >
                      THAY ĐỔI KHÓA MẬT MÃ
                    </Button>
                  </Form>
                </div>
              )}

              {activeBentoTab === "preferences" && (
                <div className="bento-subview-panel preferences-empty-view animate-fade-in">
                  <SlidersOutlined className="empty-panel-icon" />
                  <span className="empty-panel-title">
                    PHÂN HỆ STUDIO ENGINE
                  </span>
                  <Paragraph className="empty-panel-desc">
                    Toàn bộ các tùy chọn thiết lập phân giải Audio Log, tần số
                    xung kết nối Socket và tinh chỉnh Theme UI Custom sẽ khả
                    dụng ở phiên bản cập nhật cấu trúc tiếp theo.
                  </Paragraph>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <style>{`
          /* Tối Ưu Hóa Giao Diện Profile Studio */
          .studio-profile-container { background: #060606; min-height: 100vh; padding: 40px 24px; font-family: 'Inter', sans-serif; }
          .profile-max-viewport { maxWidth: 1140px; margin: 0 auto !important; }

          /* Khung Tải Dữ Liệu */
          .profile-studio-loader { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #060606; gap: 16px; }
          .loader-studio-txt { color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 2px; }

          /* Hệ Thống Bento Card */
          .bento-profile-card { background: #111111 !important; border: 1px solid #161616 !important; border-radius: 20px !important; overflow: hidden; padding: 24px !important; }
          .content-workspace-card { min-height: 560px; display: flex; flex-direction: column; justify-content: flex-start; }
          .studio-divider-dark { border-color: #161616 !important; margin: 20px 0; }

          /* Khu Vực Avatar Trái */
          .center-identity { text-align: center; }
          .avatar-secure-viewport { display: flex; justify-content: center; margin-bottom: 20px; }
          .avatar-pulse-glow { position: relative; display: inline-block; padding: 6px; background: #151515; border: 1px solid #1c1c1c; border-radius: 50%; }
          .avatar-core-lens { border: 2px solid #ff6600 !important; background: #222 !important; box-shadow: 0 0 20px rgba(255, 102, 0, 0.15); }
          .btn-trigger-lens-upload { position: absolute; bottom: 8px; right: 8px; background: #ff6600 !important; border: none !important; color: #fff !important; width: 34px !important; height: 34px !important; display: flex !important; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(255,102,0,0.3); }
          .btn-trigger-lens-upload:hover { transform: scale(1.05); }

          .identity-user-name { font-weight: 900 !important; color: #fff !important; letter-spacing: -0.8px; margin: 12px 0 2px 0 !important; font-size: 18px !important; }
          .identity-user-slug { font-family: 'Space Mono', monospace; color: #fff; font-size: 10px; font-weight: 700; display: block; margin-bottom: 12px; letter-spacing: 0.5px; }
          .status-indicator-strip { background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.12); color: #22c55e; font-size: 9px; font-weight: 800; padding: 5px 14px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.5px; }
          .pulse-signal-dot { width: 5px; height: 5px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #22c55e; }

          /* Bộ Chuyển Đổi Tab Kỹ Thuật Số (Bento Navigation) */
          .bento-navigation-vertical { display: flex; flex-direction: column; gap: 8px; text-align: left; }
          .bento-nav-item-block { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s ease; }
          .bento-nav-item-block:hover { background: #151515; }
          .bento-nav-item-block.active { background: #161616; border-color: #222; }
          
          .nav-item-icon { font-size: 15px; color: #ffff; transition: color 0.2s; }
          .bento-nav-item-block.active .nav-item-icon { color: #ff6600; }
          .nav-item-meta { display: flex; flex-direction: column; line-height: 1.3; }
          .nav-item-title { font-size: 12px; font-weight: 800; color: #888; letter-spacing: 0.3px; transition: color 0.2s; }
          .bento-nav-item-block.active .nav-item-title { color: #fff; }
          .nav-item-desc { font-size: 10px; color: #fff; font-weight: 500; }

          .btn-studio-disconnect { background: rgba(239, 68, 68, 0.03) !important; border: 1px solid rgba(239, 68, 68, 0.1) !important; color: #effff4 !important; font-weight: 700; border-radius: 10px !important; height: 42px !important; font-size: 12px; letter-spacing: 0.5px; transition: all 0.2s; }
          .btn-studio-disconnect:hover { background: #effff4 !important; color: #fff !important; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }

          /* Phân Phối Vùng Điền Form Phải */
          .subview-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 30px; background: #141414; padding: 16px 20px; border-radius: 14px; border: 1px solid #1a1a1a; }
          .subview-header-icon { font-size: 16px; color: #ff6600; margin-top: 3px; filter: drop-shadow(0 0 6px rgba(255,102,0,0.3)); }
          .subview-main-title { font-weight: 900 !important; color: #fff !important; font-size: 15px !important; letter-spacing: -0.3px; margin: 0 0 2px 0 !important; }
          .subview-sub-desc { color: #666; font-size: 12px; display: block; }

          /* Form Ô Nhập Liệu Sleek */
          .studio-form-sleek .ant-form-item-label label { color: #ffff !important; font-size: 10px !important; font-weight: 800 !important; letter-spacing: 0.5px; }
          .studio-input-core { background: #0c0c0c !important; border: 1px solid #161616 !important; border-radius: 10px !important; color: #fff !important; padding: 10px 14px !important; transition: all 0.2s; }
          .studio-input-core .ant-input-prefix { color: #fff; margin-right: 8px; }
          .studio-input-core input { background: transparent !important; }
          .studio-input-core:hover, .ant-input-affix-wrapper-focused { border-color: #222 !important; }
          .ant-input-affix-wrapper-focused { box-shadow: 0 0 8px rgba(255, 102, 0, 0.1) !important; border-color: #ff6600 !important; }
          .studio-input-core:focus-within .ant-input-prefix { color: #ff6600; }
          
          .input-disabled-spec { background: #141414 !important; border-color: #1a1a1a !important; color: #ffff !important; cursor: not-allowed; }
          .input-disabled-spec input { color: #ffff !important; cursor: not-allowed; }
          .input-disabled-spec .ant-input-prefix { color: #333; }

          .form-bento-notice-bar { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,102,0,0.02); border: 1px solid rgba(255,102,0,0.08); padding: 12px 16px; border-radius: 10px; margin-top: 10px; }
          .form-bento-notice-bar .notice-icon { color: #ff6600; font-size: 13px; margin-top: 2px; }
          .form-bento-notice-bar .notice-text { color: #ffff; font-size: 11px; line-height: 1.5; font-weight: 500; }

          .btn-studio-save-action { background: #ff6600 !important; border: none !important; color: #fff !important; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; height: 45px !important; padding: 0 35px !important; border-radius: 10px !important; box-shadow: 0 6px 16px rgba(255, 102, 0, 0.2) !important; transition: all 0.2s; }
          .btn-studio-save-action:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3) !important; }

          /* Vùng Trống Cho Cấu Hình Engine */
          .preferences-empty-view { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 40px; margin-top: 40px; }
          .empty-panel-icon { font-size: 32px; color: #1c1c1c; margin-bottom: 16px; }
          .empty-panel-title { color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 1px; display: block; margin-bottom: 8px; }
          .empty-panel-desc { color: #ffff !important; font-size: 13px !important; max-width: 420px; line-height: 1.6 !important; margin: 0 !important; }

          /* Hiệu ứng Fade In */
          .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ProfilePage;
