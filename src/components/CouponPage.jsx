import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  InputGroup,
  Spinner,
  Pagination,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import toast from "react-hot-toast";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../api/couponApi";
import { MdAutoFixOff,MdRemoveRedEye  ,MdDelete  } from "react-icons/md";


const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "percent",
    value: "",
    apply_to: "order",
    quantity: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  // 🟢 Lấy danh sách coupon
  const fetchCoupons = async (page = 1, query = "") => {
  try {
    setLoading(true);
    const res = await getCoupons(page, 10, query);

    // ✅ Tự động kiểm tra ngày & số lượng
    const now = new Date();
    const updatedCoupons = res.data.map((c) => {
      const endDate = new Date(c.end_date);
      if (c.quantity <= 0 || endDate < now) {
        return { ...c, status: "inactive" };
      }
      return c;
    });

    setCoupons(updatedCoupons);
    setCurrentPage(res.currentPage || 1);
    setTotalPages(res.totalPages || 1);
  } catch (error) {
    toast.error("Không thể tải danh sách mã giảm giá");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCoupons(1, search);
  }, []);

  // 🕓 Tìm kiếm có debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCoupons(1, search);
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  // 🟢 Xử lý thay đổi form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟢 Mở modal thêm / sửa
  const handleShowModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm(coupon);
    } else {
      setEditingCoupon(null);
      setForm({
        code: "",
        description: "",
        type: "percent",
        value: "",
        apply_to: "order",
        quantity: "",
        min_order_value: "",
        start_date: "",
        end_date: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  // 🟢 Lưu dữ liệu (thêm hoặc sửa)
  const handleSave = async () => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, form);
        toast.success( "Cập nhật mã giảm giá thành công");
      } else {
        await createCoupon(form);
        toast.success( "Thêm mã giảm giá thành công");
      }
      setShowModal(false);
      fetchCoupons(currentPage, search);
    } catch (err) {
      toast.error("Lỗi khi lưu mã giảm giá");
    }
  };

  // 🟢 Xóa mã
const openDeleteModal = (coupon) => {
  setCouponToDelete(coupon);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  try {
    await deleteCoupon(couponToDelete.id);
    toast.success("Xóa mã giảm giá thành công");
    setShowDeleteModal(false);
    setCouponToDelete(null);
    fetchCoupons(currentPage, search);
  } catch {
    toast.error("Không thể xóa mã giảm giá");
  }
};


  // 🟢 Chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCoupons(page, search);
  };

  return (
    <div className="p-4" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary mb-0">🎟️ Quản lý Mã Giảm Giá</h3>
        
      </div>

      {/* Tìm kiếm */}
      <Row>
       <Col md='auto'>
        <Button onClick={() => handleShowModal()}>
          + Thêm mã giảm giá
        </Button>
       </Col>
        <Col md={4}>
           <Form className="mb-4">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="🔍 Tìm kiếm theo mã hoặc mô tả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Form>
        </Col>
      </Row>
      {/* Bảng danh sách */}
      <div style={{ overflowX: "auto" }}>
        <Table
          bordered
          hover
          responsive
          className="align-middle text-center"
          style={{
            minWidth: "1100px",
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <thead className="table-primary text-nowrap">
            <tr>
              <th>#</th>
              <th>Mã</th>
              <th>Mô tả</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Áp dụng</th>
              <th>Số lượng</th>
              <th>Đơn tối thiểu</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="py-4 text-center">
                  <Spinner animation="border" variant="primary" />
                </td>
              </tr>
            ) : coupons.length > 0 ? (
              coupons.map((c, index) => (
                <tr key={c.id}>
                  <td>{index + 1 + (currentPage - 1) * 10}</td>
                  <td className="fw-bold text-primary">{c.code}</td>
                  <td className="text-start">{c.description}</td>
                  <td>{c.type === "percent" ? "Phần trăm (%)" : "Giá trị (₫)"}</td>
                  <td>
                    {c.type === "percent"
                      ? `${c.value}%`
                      : `${Number(c.value).toLocaleString()}₫`}
                  </td>
                  <td>{c.apply_to === "order" ? "Hóa đơn" : "Sản phẩm"}</td>
                  <td>{c.quantity}</td>
                  <td>{parseInt(c.min_order_value).toLocaleString()}₫</td>
                  <td>
                    {new Date(c.start_date).toLocaleDateString()} –{" "}
                    {new Date(c.end_date).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === "active" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {c.status === "active" ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td>
                      <OverlayTrigger
                                                              placement="top"
                                                              overlay={<Tooltip>Sửa</Tooltip>} >
                                                              <Button variant="outline-success" size="sm" className="me-1" 
                                                                      onClick={() => handleShowModal(c)}>
                                                                      <MdAutoFixOff />
                                                              </Button>
                                                            </OverlayTrigger>
                    <OverlayTrigger
                                                              placement="top"
                                                              overlay={<Tooltip>Xóa</Tooltip>} >
                                                              <Button variant="outline-danger" size="sm" className="me-1" 
                                                                      onClick={() =>  openDeleteModal(c.id)}>
                                                                      <MdDelete />
                                                              </Button>
                                                            </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="py-4 text-muted">
                  Không có mã giảm giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Phân trang */}
     {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            />

            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={currentPage === i + 1}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </Pagination>
        </div>
      )}

<Modal
  show={showDeleteModal}
  onHide={() => setShowDeleteModal(false)}
  centered
>
  <Modal.Header closeButton className="bg-danger text-white">
    <Modal.Title>Xác nhận xóa mã giảm giá</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {couponToDelete && (
      <>
        <p>Bạn có chắc muốn xóa mã giảm giá này?</p>

        <div className="alert alert-warning mb-0">
          ⚠️ Hành động này không thể hoàn tác
        </div>
      </>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
      Hủy
    </Button>
    <Button variant="danger" onClick={confirmDelete}>
      Xóa mã
    </Button>
  </Modal.Footer>
</Modal>

      {/* Modal thêm/sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {editingCoupon ? "✏️ Sửa mã giảm giá" : "➕ Thêm mã giảm giá"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto", background: "#f8f9fa" }}>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mã giảm giá</Form.Label>
                  <Form.Control
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Nhập mã, ví dụ SALE10"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Loại</Form.Label>
                  <Form.Select name="type" value={form.type} onChange={handleChange}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Giá trị cố định (₫)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Giá trị giảm</Form.Label>
                  <Form.Control
                    type="number"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    placeholder="VD: 10 hoặc 50000"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Số lượng mã</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Giá trị đơn hàng tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="min_order_value"
                    value={form.min_order_value}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày bắt đầu</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={form.start_date?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày kết thúc</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={form.end_date?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Áp dụng cho</Form.Label>
                  <Form.Select
                    name="apply_to"
                    value={form.apply_to}
                    onChange={handleChange}
                  >
                    <option value="order">Toàn bộ đơn hàng</option>
                    <option value="product">Theo sản phẩm</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group>
              <Form.Label>Mô tả chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập mô tả mã giảm giá..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu lại
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CouponPage;
