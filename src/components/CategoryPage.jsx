import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Row,
  Col,
  Image,
  Pagination,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import toast from "react-hot-toast";
import {
  getCategories1,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryApi";
import { MdAutoFixOff, MdDelete } from "react-icons/md";

const CategoryPage = () => {
  const WEB_URL = "http://localhost:5000";
  const [categories, setCategories] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    status: "active",
  });

  const [allowEditSlug, setAllowEditSlug] = useState(false);

  // Search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading state
  const [loading, setLoading] = useState(false); // table loading
  const [submitLoading, setSubmitLoading] = useState(false); // form submit loading
  const [overlayLoading, setOverlayLoading] = useState(false); // full screen loading

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Slug function
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

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories1(page, 10, search);
      setCategories(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
    } catch {
      toast.error("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line
  }, [page, search]);

  // Open modal
  const handleShow = (item = null) => {
    setEditItem(item);
    setAllowEditSlug(false);

    if (item) {
      setFormData({
        name: item.name,
        slug: item.slug,
        description: item.description,
        image: null,
        status: item.status,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        image: null,
        status: "active",
      });
    }

    setShowModal(true);
  };

  // Auto update slug
  const handleNameChange = (value) => {
    const newSlug = slugify(value);
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: allowEditSlug ? prev.slug : newSlug,
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setOverlayLoading(true);

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("slug", formData.slug);
    fd.append("description", formData.description);
    fd.append("status", formData.status);
    if (formData.image) fd.append("image", formData.image);

    try {
      if (editItem) {
        await updateCategory(editItem.id, fd);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(fd);
        toast.success("Thêm danh mục thành công");
      }

      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu danh mục");
    } finally {
      setSubmitLoading(false);
      setOverlayLoading(false);
    }
  };

  // Delete
  const handleDeleteClick = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteItem.id);
      toast.success("Đã xóa danh mục");
      setShowDeleteModal(false);
      loadCategories();
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  // Pagination items
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => {
          setPage(i);
          setCurrentPage(i);
        }}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <div className="p-3 position-relative">

      {/* Full screen overlay loading */}
      {overlayLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(255,255,255,0.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <Spinner animation="border" variant="primary" style={{ width: 70, height: 70 }} />
        </div>
      )}

      <h4 className="mb-3">Quản lý danh mục</h4>

      <Row className="mb-3">
        <Col md="auto">
          <Button onClick={() => handleShow()}>+ Thêm danh mục</Button>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Tìm kiếm danh mục..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </Col>
      </Row>

      <Table bordered hover>
        <thead>
          <tr className="text-center">
            <th>#</th>
            <th>Ảnh</th>
            <th>Tên danh mục</th>
            <th>Slug</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: 50, height: 50 }} />
                <div className="mt-2">Đang tải dữ liệu...</div>
              </td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">Không có danh mục</td>
            </tr>
          ) : (
            categories.map((c, i) => (
              <tr key={c.id}>
                <td>{(currentPage - 1) * 10 + i + 1}</td>
                <td className="text-center">
                  {c.image && (
                    <Image
                      src={`${WEB_URL}/uploads/products/${c.image}`}
                      width="60"
                      height="60"
                      rounded
                    />
                  )}
                </td>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.description?.slice(0, 50)}...</td>
                <td>{c.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                <td className="text-center">
                  <OverlayTrigger placement="top" overlay={<Tooltip>Sửa</Tooltip>}>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-1"
                      onClick={() => handleShow(c)}
                    >
                      <MdAutoFixOff />
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Xóa</Tooltip>}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(c)}
                    >
                      <MdDelete />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end">
        <Pagination>{paginationItems}</Pagination>
      </div>

      {/* Modal thêm/sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? "Sửa danh mục" : "Thêm danh mục"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Cho phép chỉnh slug thủ công"
                checked={allowEditSlug}
                onChange={(e) => {
                  setAllowEditSlug(e.target.checked);
                  if (!e.target.checked) {
                    setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
                  }
                }}
              />
              <Form.Label className="mt-2">Slug</Form.Label>
              <Form.Control
                value={formData.slug}
                readOnly={!allowEditSlug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh danh mục</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </Form.Select>
            </Form.Group>

            <div className="text-end">
              <Button type="submit" variant="primary" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang xử lý...
                  </>
                ) : (
                  editItem ? "Cập nhật" : "Thêm mới"
                )}
              </Button>
            </div>

          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteItem ? (
            <>
              <p>
                Bạn có chắc muốn xóa danh mục{" "}
                <strong>{deleteItem.name}</strong> không?
              </p>
              <p className="text-danger small">Hành động này không thể hoàn tác.</p>
            </>
          ) : (
            "Đang tải..."
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CategoryPage;
