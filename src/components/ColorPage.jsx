import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Row, Col, Pagination, 
  Tooltip, Spin, ColorPicker, Space, Typography, ConfigProvider, Card
} from "antd";
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  BgColorsOutlined, SearchOutlined 
} from "@ant-design/icons";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "../api/colorApi";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const ColorPage = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentColor, setCurrentColor] = useState({ name: "", code: "#000000" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // Tăng limit một chút cho cân đối bảng

  const fetchColorsData = async () => {
    try {
      setLoading(true);
      const res = await getColors({ page, limit, search });
      setColors(res?.data ?? []);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColorsData();
  }, [page, search]);

  const handleSave = async () => {
    if (!currentColor.name) return toast.error("Vui lòng nhập tên màu!");
    try {
      setSaving(true);
      if (currentColor.id) {
        await updateColor(currentColor.id, currentColor);
        toast.success("Cập nhật thành công!");
      } else {
        await createColor(currentColor);
        toast.success("Thêm màu mới thành công!");
      }
      setShowModal(false);
      setCurrentColor({ name: "", code: "#000000" });
      fetchColorsData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteColor(colorToDelete.id);
      toast.success("Đã xóa màu!");
      setShowDeleteModal(false);
      fetchColorsData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: <Text style={{ color: "#888" }}>MÃ SỐ</Text>,
      dataIndex: "id",
      render: (id) => <Text style={{ color: "#555" }}>#C{2000 + id}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>TÊN MÀU SẮC</Text>,
      dataIndex: "name",
      render: (name) => <Text style={{ color: "#fff", fontWeight: "600" }}>{name.toUpperCase()}</Text>,
    },
    {
      title: <Text style={{ color: "#888" }}>HIỂN THỊ</Text>,
      dataIndex: "code",
      render: (code) => (
        <Space size="middle">
          <div
            style={{
              width: 50,
              height: 20,
              background: code,
              borderRadius: 4,
              border: "1px solid #333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
            }}
          />
          <Text style={{ color: "#ff6600", fontFamily: "monospace" }}>{code.toUpperCase()}</Text>
        </Space>
      ),
    },
    {
      title: <Text style={{ color: "#888" }}>THAO TÁC</Text>,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              ghost
              style={{ color: "#40a9ff", borderColor: "#40a9ff" }}
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentColor(record);
                setShowModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              ghost
              icon={<DeleteOutlined />}
              onClick={() => {
                setColorToDelete(record);
                setShowDeleteModal(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#141414",
          colorText: "#ffffff",
          colorPrimary: "#ff6600",
          borderRadius: 8,
          colorBorder: "#333",
        },
        components: {
          Table: {
            headerBg: "#1a1a1a",
            rowHoverBg: "#1f1f1f",
            colorHeader: "#fff",
          },
          Modal: {
            contentBg: "#141414",
            headerBg: "#141414",
          },
          Input: {
            colorBgContainer: "#0a0a0a",
            colorText: "#fff",
          }
        }
      }}
    >
      <div style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}>
        
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              <BgColorsOutlined style={{ color: "#ff6600", marginRight: 12 }} />
              Quản lý Bảng màu
            </Title>
            <Text style={{ color: "#666" }}>Thiết lập các tùy chọn màu sắc cho thiết bị</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentColor({ name: "", code: "#000000" });
                setShowModal(true);
              }}
              style={{ fontWeight: "bold" }}
            >
              THÊM MÀU MỚI
            </Button>
          </Col>
        </Row>

        {/* SEARCH BAR */}
        <Card style={{ marginBottom: 20, background: "#141414", border: "1px solid #222" }}>
          <Col span={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#ff6600" }} />}
              placeholder="Tìm tên hoặc mã màu (Hex)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="white-text-input"
            />
          </Col>
        </Card>

        {/* BẢNG DỮ LIỆU */}
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 100 }}>
              <Spin size="large" />
              <div style={{ color: "#666", marginTop: 10 }}>Đang tải bảng màu...</div>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={colors}
              rowKey="id"
              pagination={false}
            />
          )}
          
          <div style={{ padding: 20, display: "flex", justifyContent: "flex-end", borderTop: "1px solid #222" }}>
            <Pagination
              current={page}
              total={totalPages * limit}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        </div>

        {/* MODAL THÊM/SỬA */}
        <Modal
          open={showModal}
          onCancel={() => setShowModal(false)}
          title={<span style={{ color: "#fff" }}>{currentColor.id ? "CẬP NHẬT MÀU" : "ĐỊNH NGHĨA MÀU MỚI"}</span>}
          onOk={handleSave}
          confirmLoading={saving}
          okText="XÁC NHẬN"
          cancelText="HỦY"
        >
          <Form layout="vertical" style={{ marginTop: 20 }}>
            <Form.Item label={<Text style={{ color: "#fff" }}>Tên màu</Text>}>
              <Input
                className="white-text-input"
                placeholder="Ví dụ: Matte Black"
                value={currentColor.name}
                onChange={(e) =>
                  setCurrentColor({ ...currentColor, name: e.target.value })
                }
              />
            </Form.Item>

            <Form.Item label={<Text style={{ color: "#fff" }}>Mã màu (Hex)</Text>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <ColorPicker
                  value={currentColor.code}
                  onChange={(color) =>
                    setCurrentColor({ ...currentColor, code: color.toHexString() })
                  }
                  showText
                />
                <Text type="secondary" style={{ fontSize: 12 }}>Chọn màu từ bảng hoặc nhập mã hex</Text>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* MODAL XÓA */}
        <Modal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onOk={handleDelete}
          confirmLoading={deleting}
          okButtonProps={{ danger: true }}
          okText="XÓA NGAY"
          cancelText="HỦY"
          title={<span style={{ color: "#fff" }}>XÁC NHẬN XÓA</span>}
        >
          <Text style={{ color: "#fff" }}>
            Bạn có chắc muốn xóa màu <b style={{ color: "#ff6600" }}>{colorToDelete?.name}</b> không? 
            Hành động này không thể hoàn tác.
          </Text>
        </Modal>

        <style>{`
          .white-text-input { background: #0a0a0a !important; border-color: #333 !important; color: #fff !important; }
          .white-text-input input { color: #fff !important; }
          .ant-pagination-item a { color: #888 !important; }
          .ant-pagination-item-active { border-color: #ff6600 !important; }
          .ant-pagination-item-active a { color: #ff6600 !important; }
          .ant-color-picker-trigger { border-color: #333 !important; background: #0a0a0a !important; }
          .ant-color-picker-trigger-text { color: #fff !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ColorPage;