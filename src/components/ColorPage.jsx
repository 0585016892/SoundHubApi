import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Pagination,
  Tooltip,
  Spin,
  ColorPicker,
  Space,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "../api/colorApi";
import toast from "react-hot-toast";

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
  const limit = 5;

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
    try {
      setSaving(true);

      if (currentColor.id) {
        await updateColor(currentColor.id, currentColor);
        toast.success("Cập nhật màu thành công!");
      } else {
        await createColor(currentColor);
        toast.success("Thêm màu thành công!");
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
    if (!colorToDelete) return;
    try {
      setDeleting(true);
      await deleteColor(colorToDelete.id);
      toast.success("Xóa màu thành công!");
      setShowDeleteModal(false);
      setColorToDelete(null);
      fetchColorsData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Antd Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (id) => `C2003${id}`,
    },
    {
      title: "Tên màu",
      dataIndex: "name",
    },
    {
      title: "Mã màu",
      dataIndex: "code",
      render: (code) => (
        <Space>
          <div
            style={{
              width: 40,
              height: 18,
              background: code,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {code}
        </Space>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa màu">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentColor(record);
                setShowModal(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa màu">
            <Button
              danger
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
    <div>
      <h3 style={{ marginBottom: 16 }}>🎨 Quản lý màu</h3>

      {/* SEARCH + ADD */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentColor({ name: "", code: "#000000" });
              setShowModal(true);
            }}
          >
            Thêm màu
          </Button>
        </Col>

        <Col span={6}>
          <Input
            placeholder="Tìm kiếm màu hoặc mã màu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      {/* TABLE */}
      <CardWrap>
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={colors}
            rowKey="id"
            pagination={false}
          />
        )}
      </CardWrap>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <Pagination
          current={page}
          total={totalPages * 10}
          onChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Add/Edit */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title={currentColor.id ? "Sửa màu" : "Thêm màu"}
        onOk={handleSave}
        confirmLoading={saving}
      >
        <Form layout="vertical">
          <Form.Item label="Tên màu">
            <Input
              value={currentColor.name}
              onChange={(e) =>
                setCurrentColor({ ...currentColor, name: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="Mã màu">
            <ColorPicker
              value={currentColor.code}
              onChange={(color) =>
                setCurrentColor({ ...currentColor, code: color.toHexString() })
              }
              showText
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Delete */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDelete}
        confirmLoading={deleting}
        okButtonProps={{ danger: true }}
        title="Xác nhận xóa"
      >
        Bạn có chắc muốn xóa màu <b>{colorToDelete?.name}</b> không?
      </Modal>
    </div>
  );
};

export default ColorPage;

// Wrapper card style
const CardWrap = ({ children }) => (
  <div
    style={{
      background: "#fff",
      padding: 16,
      borderRadius: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    }}
  >
    {children}
  </div>
);
