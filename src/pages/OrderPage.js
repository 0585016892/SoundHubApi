import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Badge,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
  Dropdown,
  Pagination,
  Modal
} from "react-bootstrap";
import toast from "react-hot-toast";
import { getOrders, updateOrder, deleteOrder } from "../api/orderApi";
import OrderDetailModal from "../components/OrderDetailModal";
import { MdRemoveRedEye, MdDelete } from "react-icons/md";
// Map trạng thái
const statusMap = {
  pending: { label: "Chờ xử lý", color: "warning" },
  shipping: { label: "Đang vận chuyển", color: "info" },
  completed: { label: "Hoàn tất", color: "success" },
  cancelled: { label: "Đã hủy", color: "danger" },
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);


  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(page, 10, search, statusFilter);
      
      setOrders(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  // ================= HANDLERS =================
  const handleView = (id) => {
    setSelectedOrder({ id });
    setShowModal(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrder(id, { order_status: status });
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const openDeleteModal = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder(orderToDelete.id);
      toast.success("Xóa đơn hàng thành công");
      setShowDeleteModal(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch {
      toast.error("Không thể xóa đơn hàng");
    }
  };


  // ================= RENDER =================
  return (
    <div className="container-fluid mt-4">
      {/* HEADER */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Quản lý đơn hàng</h2>
        </Col>

        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Tìm theo tên, email, điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Form.Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(statusMap).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* LOADING */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table striped bordered hover responsive className="align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Tổng tiền</th>
                  <th>Thành tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((o, index) => (
                    <tr key={o.id}>
                      <td>{(page - 1) * 10 + index + 1}</td>
                      <td>{o.full_name}</td>
                      <td>{o.email}</td>
                      <td>{o.phone}</td>
                      <td>{Number(o.total_amount).toLocaleString()}₫</td>
                      <td className="fw-bold text-danger">
                        {Number(o.final_amount).toLocaleString()}₫
                      </td>

                      {/* STATUS */}
                      <td>
                          {o.order_status === "completed" || o.order_status === "cancelled" ? (
                            <Badge bg={statusMap[o.order_status].color}>
                              {statusMap[o.order_status].label}
                            </Badge>
                          ) : (
                            <Form.Select
                              size="sm"
                              value={o.order_status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            >
                              {Object.entries(statusMap).map(([key, val]) => (
                                <option key={key} value={key}>
                                  {val.label}
                                </option>
                              ))}
                            </Form.Select>
                          )}
                        </td>


                      <td>
                        {new Date(o.created_at).toLocaleString("vi-VN")}
                      </td>

                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Xem chi tiết</Tooltip>}
                        >
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-1"
                            onClick={() => handleView(o.id)}
                          >
                            <MdRemoveRedEye />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Xóa</Tooltip>}
                        >
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(o.id)}
                          >
                            <MdDelete />
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.Prev
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          />

          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={page === i + 1}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          />
        </Pagination>
      )}
    <Modal
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
      centered
    >
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>Xác nhận xóa đơn hàng</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {orderToDelete && (
          <>
            <p>Bạn có chắc muốn xóa đơn hàng này?</p>
            <div className="alert alert-warning mt-3 mb-0">
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
          Xóa đơn hàng
        </Button>
      </Modal.Footer>
    </Modal>

      {/* MODAL */}
      <OrderDetailModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        orderId={selectedOrder?.id}
        statusMap={statusMap}
      />
    </div>
  );
};

export default OrderPage;
