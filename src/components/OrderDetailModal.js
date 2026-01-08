import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner, Badge, Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { getOrderById } from "../api/orderApi";

// ===== STATUS MAP =====
const statusMap = {
  pending: { label: "Chờ xử lý", bg: "warning" },
  shipping: { label: "Đang vận chuyển", bg: "info" },
  completed: { label: "Hoàn tất", bg: "success" },
  cancelled: { label: "Đã hủy", bg: "danger" },
};

const OrderDetailModal = ({ show, handleClose, orderId }) => {
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== FETCH ORDER =====
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(orderId);

        setOrder({
          ...res,
          items: Array.isArray(res.items) ? res.items : [],
        });
      } catch (error) {
        toast.error("Không thể tải chi tiết đơn hàng");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ===== TOTAL =====
  const subTotal = Number(order?.order.total_amount || 0);
  const discount = Number(order?.order.discount_amount || 0);
  const finalTotal = Number(order?.order.final_amount || 0);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      {/* ===== HEADER ===== */}
      <Modal.Header
        closeButton
        className="text-white"
        style={{ background: "linear-gradient(90deg,#0d6efd,#6610f2)" }}
      >
        <Modal.Title>
          🧾 Đơn hàng #{order?.order.id}
          {order?.order.order_status && (
            <Badge
              bg={statusMap[order.order.order_status]?.bg}
              className="ms-3 px-3 rounded-pill"
            >
              {statusMap[order.order.order_status]?.label}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      {/* ===== BODY ===== */}
      <Modal.Body>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : order ? (
          <>
            {/* ===== CUSTOMER & PAYMENT ===== */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <div className="p-3 border rounded bg-light h-100">
                  <h6 className="text-primary mb-2">👤 Thông tin khách hàng</h6>
                  <p className="mb-1"><strong>Họ tên:</strong> {order.order.full_name}</p>
                  <p className="mb-1"><strong>Email:</strong> {order.order.email}</p>
                  <p className="mb-1"><strong>Điện thoại:</strong> {order.order.phone}</p>
                  <p className="mb-0">
                    <strong>Ngày đặt:</strong>{" "}
                    {new Date(order.order.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-3 border rounded bg-light h-100">
                  <h6 className="text-primary mb-2">💳 Thanh toán</h6>
                  <p className="mb-1">
                    <strong>Phương thức:</strong>{" "}
                    <Badge bg="secondary" className="rounded-pill">
                      {order.order.payment_method?.toUpperCase()}
                    </Badge>
                  </p>
                  <p className="mb-1">
                    <strong>Mã giảm giá:</strong>{" "}
                    {order.order.coupon_code ? (
                      <Badge bg="success">{order.order.coupon_code}</Badge>
                    ) : (
                      <span className="text-muted">Không có</span>
                    )}
                  </p>
                  <p className="mb-0">
                    <strong>Ghi chú:</strong>{" "}
                    {order.order.note || <span className="text-muted">Không có</span>}
                  </p>
                </div>
              </Col>
            </Row>

            {/* ===== ADDRESS ===== */}
            <div className="p-3 border rounded bg-white mb-3">
              <h6 className="text-primary mb-2">📍 Địa chỉ giao hàng</h6>
              <p className="mb-0">{order.order.address}</p>
            </div>

            {/* ===== PRODUCT LIST ===== */}
            <h6 className="mb-2 text-secondary">🛒 Danh sách sản phẩm</h6>

            <div
              className="border rounded shadow-sm"
              style={{ maxHeight: 350, overflowY: "auto" }}
            >
              <Table hover responsive className="mb-0 align-middle">
                <thead
                  className="table-dark"
                  style={{ position: "sticky", top: 0, zIndex: 2 }}
                >
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Màu</th>
                    <th>SL</th>
                    <th>Giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.product_name}</td>
                        <td><Badge bg="secondary">{item.color}</Badge></td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.price).toLocaleString()} ₫</td>
                        <td className="fw-bold text-success">
                          {Number(item.total).toLocaleString()} ₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        Không có sản phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* ===== TOTAL ===== */}
            <div className="border rounded p-3 mt-4 bg-light">
              <Row>
                <Col md={6}></Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tạm tính:</span>
                    <strong>{subTotal.toLocaleString()} ₫</strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>Giảm giá:</span>
                    <strong>- {discount.toLocaleString()} ₫</strong>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between fs-5 text-success">
                    <strong>Thành tiền:</strong>
                    <strong>{finalTotal.toLocaleString()} ₫</strong>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : (
          <p className="text-center text-muted">Không có dữ liệu</p>
        )}
      </Modal.Body>

      {/* ===== FOOTER ===== */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailModal;
