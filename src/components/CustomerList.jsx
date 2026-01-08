import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import {
  getCustomers,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerById
} from "../api/customerApi";
import {
  MdAutoFixOff,
  MdRemoveRedEye,
  MdDelete
} from "react-icons/md";
import toast from "react-hot-toast";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FETCH LIST ================= */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers(token, page, 20);
      const filtered = res.data.filter(
        (c) =>
          c.full_name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      );
      setCustomers(filtered);
    } catch {
      toast.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  /* ================= STATUS ================= */
  const handleStatusChange = async (id, status) => {
    try {
      await updateCustomerStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(customerToDelete.id);
      toast.success("Xóa khách hàng thành công");
      setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  /* ================= DETAIL ================= */
  const handleViewDetail = async (id) => {
    try {
      const data = await getCustomerById(id);
      setSelectedCustomer(data);
      setShowDetailModal(true);
    } catch {
      toast.error("Không thể lấy chi tiết khách hàng");
    }
  };

  /* ================= EDIT (MOCK) ================= */
  const handleEdit = (customer) => {
    toast.success(`Chức năng sửa "${customer.full_name}" đang phát triển`);
  };

  /* ================= RENDER ================= */
  return (
    <div className="container-fluid mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">👥 Quản lý khách hàng</h3>
          <small className="text-muted">
            Theo dõi thông tin & lịch sử mua hàng
          </small>
        </div>

        <InputGroup style={{ maxWidth: 320 }}>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            placeholder="Tìm theo tên hoặc email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((c, index) => (
                    <tr key={c.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="fw-semibold">{c.full_name}</div>
                      </td>

                      <td>{c.email}</td>
                      <td>{c.phone || "—"}</td>
                      <td className="text-truncate" style={{ maxWidth: 200 }}>
                        {c.address || "—"}
                      </td>

                      <td>
                        <Form.Select
                          size="sm"
                          value={c.status}
                          className={`fw-semibold ${
                            c.status === "active"
                              ? "text-success"
                              : "text-secondary"
                          }`}
                          onChange={(e) =>
                            handleStatusChange(c.id, e.target.value)
                          }
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
                        </Form.Select>
                      </td>

                      <td className="text-center">
                        <OverlayTrigger overlay={<Tooltip>Xem chi tiết</Tooltip>}>
                          <Button
                            size="sm"
                            variant="light"
                            className="me-1 border"
                            onClick={() => handleViewDetail(c.id)}
                          >
                            <MdRemoveRedEye />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                          <Button
                            size="sm"
                            variant="light"
                            className="me-1 border"
                            onClick={() => handleEdit(c)}
                          >
                            <MdAutoFixOff />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                          <Button
                            size="sm"
                            variant="light"
                            className="border text-danger"
                            onClick={() => handleDeleteClick(c)}
                          >
                            <MdDelete />
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Không có khách hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Xác nhận xóa khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ⚠️ Hành động này không thể hoàn tác
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

      {/* DETAIL MODAL */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>📋 Chi tiết khách hàng</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!selectedCustomer ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {/* INFO */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light h-100">
                    <h6 className="fw-bold text-primary mb-3">👤 Cá nhân</h6>
                    <p><strong>Họ tên:</strong> {selectedCustomer.full_name}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    <p><strong>Điện thoại:</strong> {selectedCustomer.phone || "—"}</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light h-100">
                    <h6 className="fw-bold text-primary mb-3">📌 Trạng thái</h6>
                    <p><strong>Địa chỉ:</strong> {selectedCustomer.address || "—"}</p>
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(selectedCustomer.created_at).toLocaleDateString()}
                    </p>
                    <span
                      className={`badge px-3 py-2 ${
                        selectedCustomer.status === "active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {selectedCustomer.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ORDERS SCROLL */}
              <h6 className="fw-bold text-primary mb-3">🧾 Lịch sử mua hàng</h6>

              <div style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: 6 }}>
                {selectedCustomer.orders?.length > 0 ? (
                  selectedCustomer.orders.map((order) => (
                    <div key={order.order_id} className="card mb-3 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <strong className="text-primary">
                            Đơn #{order.order_id}
                          </strong>
                          <span
                            className={`badge ${
                              order.status === "completed"
                                ? "bg-success"
                                : order.status === "pending"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <p className="mb-1">
                          🗓 {new Date(order.order_date).toLocaleString()}
                        </p>

                        <p className="fw-bold text-danger">
                          💰 {Number(order.total_amount).toLocaleString()}₫
                        </p>

                        <ul className="list-group list-group-flush">
                          {order.items.map((item, i) => (
                            <li
                              key={i}
                              className="list-group-item d-flex justify-content-between"
                            >
                              <span>
                                {item.product_name} x{item.quantity}
                              </span>
                              <span>
                                {Number(item.price).toLocaleString()}₫
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted fst-italic">
                    Khách hàng chưa có đơn hàng nào.
                  </p>
                )}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerList;
