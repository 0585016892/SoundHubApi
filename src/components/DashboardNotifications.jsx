import React, { useState } from "react";
import { Badge, Card, List, Typography, Popover } from "antd";
import {
  BellFilled,
  ShoppingCartOutlined,
  MessageOutlined,
  WarningOutlined,
  GiftOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// DATA DEMO
const notificationsData = [
  { id: 1, title: "Đơn hàng mới", message: "Có 3 đơn hàng mới chờ xử lý", type: "order" },
  { id: 2, title: "Tin nhắn mới", message: "Khách hàng Nguyễn Văn A gửi tin nhắn", type: "message" },
  { id: 3, title: "Sản phẩm hết hàng", message: "Loa Bluetooth XYZ sắp hết kho", type: "alert" },
  { id: 4, title: "Mã giảm giá", message: "Mã SALE50 hết hạn hôm nay", type: "coupon" },
  { id: 5, title: "Hệ thống", message: "Backup dữ liệu thành công", type: "system" },
];

// ICON & COLOR
const typeConfig = {
  order: { color: "green", icon: <ShoppingCartOutlined /> },
  message: { color: "blue", icon: <MessageOutlined /> },
  alert: { color: "red", icon: <WarningOutlined /> },
  coupon: { color: "orange", icon: <GiftOutlined /> },
  system: { color: "gray", icon: <SettingOutlined /> },
};

const DashboardNotifications = () => {
  const [open, setOpen] = useState(false);

  const content = (
    <Card
      style={{ width: 320, maxHeight: 400, overflowY: "auto" }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: 10, fontWeight: 600, borderBottom: "1px solid #eee" }}>
        🔔 Thông báo
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notificationsData}
        renderItem={(n) => (
          <List.Item style={{ padding: "10px 12px", cursor: "pointer" }}>
            <List.Item.Meta
              avatar={
                <Badge color={typeConfig[n.type].color} text={typeConfig[n.type].icon} />
              }
              title={<Text strong>{n.title}</Text>}
              description={<Text type="secondary">{n.message}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <div style={{ position: "fixed", top: 70, right: 20, zIndex: 1200 }}>
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
      >
        <Badge count={notificationsData.length} offset={[-5, 5]}>
          <BellFilled style={{ fontSize: 24, color: "#1677ff", cursor: "pointer" }} />
        </Badge>
      </Popover>
    </div>
  );
};

export default DashboardNotifications;
