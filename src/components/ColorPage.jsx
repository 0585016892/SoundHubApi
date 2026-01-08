import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  FormControl,
  Row,
  Col,
  Pagination,
  OverlayTrigger,
  Tooltip,
  Spinner
} from "react-bootstrap";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "../api/colorApi";
import toast from "react-hot-toast";
import { MdAutoFixOff, MdDelete } from "react-icons/md";

const ColorPage = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false); // ⭐ loading danh sách
  const [saving, setSaving] = useState(false);   // ⭐ loading khi lưu
  const [deleting, setDeleting] = useState(false); // ⭐ loading khi xóa

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
      setLoading(true); // ⭐ bật loading
      const res = await getColors({ page, limit, search });
      const list = res?.data ?? [];
      setColors(list);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ⭐ tắt loading
    }
  };

  useEffect(() => {
    fetchColorsData();
  }, [page, search]);

  const handleSave = async () => {
    try {
      setSaving(true); // ⭐ bật loading nút Lưu

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
      setSaving(false); // ⭐ tắt loading
    }
  };

  const confirmDelete = (color) => {
    setColorToDelete(color);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!colorToDelete) return;
    try {
      setDeleting(true); // ⭐ bật loading xóa

      await deleteColor(colorToDelete.id);
      toast.success("Xóa màu thành công!");

      setShowDeleteModal(false);
      setColorToDelete(null);
      fetchColorsData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false); // ⭐ tắt loading
    }
  };

  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() => setPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination>
        <Pagination.Prev onClick={() => page > 1 && setPage(page - 1)} />
        {items}
        <Pagination.Next onClick={() => page < totalPages && setPage(page + 1)} />
      </Pagination>
    );
  };

  return (
    <div className="p-3">
      <h4 className="mb-3">Quản lý màu</h4>

      {/* SEARCH + ADD */}
      <Row className="mb-3">
        <Col md="auto">
          <Button
            onClick={() => {
              setCurrentColor({ name: "", code: "#000000" });
              setShowModal(true);
            }}
          >
            + Thêm màu
          </Button>
        </Col>
        <Col md={4}>
          <FormControl
            placeholder="Tìm kiếm màu hoặc mã màu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* ⭐ LOADING TABLE */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <Table bordered hover>
          <thead className="text-center">
            <tr>
              <th>ID</th>
              <th>Tên màu</th>
              <th>Mã màu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((c) => (
              <tr key={c.id}>
                <td>{`C2003${c.id}`}</td>
                <td>{c.name}</td>
                <td>
                  <div
                    style={{
                      display: "inline-block",
                      background: c.code,
                      width: "50px",
                      height: "20px",
                      marginRight: "10px",
                      border: "1px solid #ccc",
                    }}
                  ></div>
                  {c.code}
                </td>
                <td className="d-flex justify-content-center gap-3">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Sửa màu</Tooltip>}
                  >
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-1"
                      onClick={() => {
                        setCurrentColor(c);
                        setShowModal(true);
                      }}
                    >
                      <MdAutoFixOff />
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Xóa màu</Tooltip>}
                  >
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="me-1"
                      onClick={() => confirmDelete(c)}
                    >
                      <MdDelete />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
            {colors.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  Không có màu nào
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-end">{renderPagination()}</div>

      {/* Modal thêm/sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{currentColor.id ? "Sửa màu" : "Thêm màu"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên màu</Form.Label>
              <Form.Control
                value={currentColor.name}
                onChange={(e) =>
                  setCurrentColor({ ...currentColor, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Mã màu</Form.Label>
              <Form.Control
                type="color"
                value={currentColor.code}
                onChange={(e) =>
                  setCurrentColor({ ...currentColor, code: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" /> Đang lưu...
              </>
            ) : currentColor.id ? (
              "Cập nhật"
            ) : (
              "Thêm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa màu <strong>{colorToDelete?.name}</strong> không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" /> Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ColorPage;
