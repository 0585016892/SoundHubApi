// src/components/DashboardNotifications.jsx
import React, { useState } from "react";
import { Card, Badge } from "react-bootstrap";

const notificationsData = [
  { id: 1, title: "Đơn hàng mới", message: "Có 3 đơn hàng mới chờ xử lý", type: "order" },
  { id: 2, title: "Tin nhắn mới", message: "Khách hàng Nguyễn Văn A gửi tin nhắn", type: "message" },
  { id: 3, title: "Sản phẩm hết hàng", message: "Loa Bluetooth XYZ sắp hết kho", type: "alert" },
  { id: 4, title: "Mã giảm giá", message: "Mã SALE50 hết hạn hôm nay", type: "coupon" },
  { id: 5, title: "Hệ thống", message: "Backup dữ liệu thành công", type: "system" },
];

const typeColor = {
  order: "success",
  message: "info",
  alert: "danger",
  coupon: "warning",
  system: "secondary",
};

const DashboardNotifications = () => {
  const [show, setShow] = useState(false);

  const toggleNotifications = () => setShow(!show);

  return (
    <div style={{ position: "fixed", top: 70, right: 20, zIndex: 1200 }}>
      {/* Button hiển thị số thông báo */}
      <div onClick={toggleNotifications} style={{ cursor: "pointer", position: "relative" }}>
        <Badge bg="danger" pill style={{ position: "absolute", top: -5, right: -5, fontSize: "0.7rem" }}>
          {notificationsData.length}
        </Badge>
        <i className="bi bi-bell-fill" style={{ fontSize: 24, color: "#33a06a" }}></i>
      </div>

      {/* Notification Dropdown */}
      {show && (
        <Card style={{ width: 300, maxHeight: 400, overflowY: "auto" }} className="shadow-sm mt-2">
          <Card.Header className="fw-bold">Thông báo</Card.Header>
          <Card.Body className="p-1">
            {notificationsData.map((n) => (
              <Card key={n.id} className="mb-1 shadow-sm" style={{ cursor: "pointer" }}>
                <Card.Body className="p-2 d-flex align-items-start gap-2">
                  <Badge bg={typeColor[n.type]} pill style={{ width: 10, height: 10, minWidth: 10, borderRadius: "50%", marginTop: 6 }}></Badge>
                  <div>
                    <div className="fw-bold">{n.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>{n.message}</div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DashboardNotifications;
