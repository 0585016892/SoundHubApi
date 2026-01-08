// src/utils/notificationSocket.js
import { io } from "socket.io-client";

let socket = null;

export function connectNotificationSocket(userId, isAdmin) {
  if (!socket) {
    socket = io("http://localhost:5000", { // đổi port nếu backend của bạn khác
      transports: ["websocket"],
    });
  }

  // join notification room ngay khi connect
  socket.on("connect", () => {
    // console.log("✅ Socket FE đã connect với ID:", socket.id);
    socket.emit("joinNotification", { userId, isAdmin });
  });

  return socket;
}

export function getSocket() {
  return socket;
}

// Lấy thông báo chưa đọc
export function fetchUnreadNotifications(userId) {
  if (!socket) return;
  socket.emit("getUnreadNotifications", { userId });
}

// Đánh dấu thông báo đã đọc
export function markNotificationAsRead(notificationId) {
  if (!socket) return;
  socket.emit("markAsRead", { notificationId });
}

export default socket;
