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
  getBrands1,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../api/brandApi";
import { MdAutoFixOff, MdDelete } from "react-icons/md";

const BrandPage = () => {
  const WEB_URL = "http://localhost:5000";

  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  /* DELETE MODAL */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    origin: "",
    description: "",
    logo: null,
    status: "active",
  });

  const [allowEditSlug, setAllowEditSlug] = useState(false);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  /* =============== SLUG ================= */
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

  /* =============== LOAD ================= */
  const loadBrands = async () => {
    setLoadingList(true);
    try {
      const data = await getBrands1(page, 8, search);
      setBrands(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch {
      toast.error("Lỗi tải thương hiệu");
    }
    setLoadingList(false);
  };

  useEffect(() => {
    loadBrands();
  }, [page, search]);

  /* =============== ADD / EDIT ================= */
  const handleShow = (brand = null) => {
    setEditBrand(brand);
    setAllowEditSlug(false);

    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        origin: brand.origin,
        description: brand.description,
        logo: null,
        status: brand.status,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        origin: "",
        description: "",
        logo: null,
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleNameChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: allowEditSlug ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) fd.append(key, formData[key]);
    });

    try {
      if (editBrand) {
        await updateBrand(editBrand.id, fd);
        toast.success("Cập nhật thành công");
      } else {
        await createBrand(fd);
        toast.success("Thêm thương hiệu thành công");
      }
      setShowModal(false);
      loadBrands();
    } catch {
      toast.error("Lỗi khi lưu");
    }
    setLoadingSubmit(false);
  };

  /* =============== DELETE ================= */
  const openDeleteModal = (brand) => {
    setBrandToDelete(brand);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;

    setLoadingDelete(true);
    try {
      await deleteBrand(brandToDelete.id);
      toast.success("Đã xóa thương hiệu");
      setShowDeleteModal(false);
      loadBrands();
    } catch {
      toast.error("Lỗi khi xóa");
    }
    setLoadingDelete(false);
  };

  /* =============== PAGINATION ================= */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
  };

  return (
    <div className="p-3">
      <h4 className="mb-3 fw-bold text-primary">🎧 Quản lý thương hiệu Loa</h4>

      <Row className="mb-3">
        <Col md="auto">
          <Button variant="primary" onClick={() => handleShow()}>
            + Thêm thương hiệu
          </Button>
        </Col>

        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="🔍 Tìm kiếm thương hiệu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* TABLE */}
      {loadingList ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table bordered hover className="shadow-sm align-middle">
            <thead className="bg-light text-center">
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Tên</th>
                <th>Xuất xứ</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {brands.length > 0 ? (
                brands.map((b, i) => (
                  <tr key={b.id}>
                    <td>{(currentPage - 1) * 10 + i + 1}</td>
                    <td className="text-center">
                      <Image
                        src={`${WEB_URL}/uploads/products/${b.logo}`}
                        width={60}
                        height={60}
                        rounded
                      />
                    </td>
                    <td className="fw-bold">{b.name}</td>
                    <td>{b.origin}</td>
                    <td>
                      {b.description?.length > 40
                        ? b.description.slice(0, 40) + "..."
                        : b.description}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === "active"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {b.status === "active" ? "Hoạt động" : "Ngừng"}
                      </span>
                    </td>
                    <td className="text-center">
                      <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => handleShow(b)}
                        >
                          <MdAutoFixOff />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => openDeleteModal(b)}
                        >
                          <MdDelete />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-3">
                    Không có thương hiệu
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {renderPagination()}
        </>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal show={showModal} centered onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Tên thương hiệu</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Check
              className="mb-2"
              type="checkbox"
              label="Cho phép chỉnh slug"
              checked={allowEditSlug}
              onChange={(e) => {
                setAllowEditSlug(e.target.checked);
                if (!e.target.checked) {
                  setFormData((prev) => ({
                    ...prev,
                    slug: slugify(prev.name),
                  }));
                }
              }}
            />

            <Form.Group className="mb-2">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                value={formData.slug}
                readOnly={!allowEditSlug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Xuất xứ</Form.Label>
              <Form.Control
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
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
              <Form.Label>Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.files[0] })
                }
              />
            </Form.Group>

            <div className="text-end">
              <Button type="submit" disabled={loadingSubmit}>
                {loadingSubmit ? <Spinner size="sm" /> : "Lưu"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* DELETE MODAL */}
      <Modal show={showDeleteModal} centered onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn chắc chắn muốn xóa thương hiệu{" "}
          <strong>{brandToDelete?.name}</strong>?
          <div className="alert alert-warning mt-2 mb-0">
            ⚠️ Hành động này không thể hoàn tác
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loadingDelete}>
            {loadingDelete ? <Spinner size="sm" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrandPage;
