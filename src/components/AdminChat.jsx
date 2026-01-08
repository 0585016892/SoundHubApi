import React, { useState, useEffect, useRef, useContext } from "react";
import { Card, ListGroup, InputGroup, Form, Button, Badge, Image } from "react-bootstrap";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";

const AdminChat = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]); // danh sách khách từ DB
  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages, setAllMessages] = useState({}); // lưu tất cả tin nhắn theo userId
  const [messages, setMessages] = useState([]); // tin nhắn của user đang chọn
  const [notifications, setNotifications] = useState({}); // badge tin nhắn mới
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Kết nối socket khi user có thông tin
  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("join", { userId: user.id, isAdmin: true });

    // Lấy danh sách khách hàng online từ server
    socket.on("updateOnlineUsers", (onlineCustomers) => {
      // onlineCustomers: mảng {id, full_name}
      setUsers(onlineCustomers);
    });

    // Nhận tin nhắn realtime
    socket.on("receiveMessage", ({ fromUserId, message, isAdminSender }) => {
      setAllMessages(prev => ({
        ...prev,
        [fromUserId]: [...(prev[fromUserId] || []), { from: "user", text: message }]
      }));

      if (fromUserId === selectedUser) {
        setMessages(prev => [...prev, { from: "user", text: message }]);
      } else {
        setNotifications(prev => ({ ...prev, [fromUserId]: (prev[fromUserId] || 0) + 1 }));
      }
    });

    return () => {
      socket.off("updateOnlineUsers");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [user, selectedUser]);

  // Khi chọn khách
  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    setNotifications(prev => ({ ...prev, [userId]: 0 }));

    // Nếu đã có tin nhắn trong state
    if (allMessages[userId]) {
      setMessages(allMessages[userId]);
    } else {
      // Lấy lịch sử chat từ server
      try {
        const res = await fetch(`http://localhost:5000/api/chat/history/${userId}`);
        const data = await res.json(); // [{from: "admin"|"user", text: "..."}]
        setMessages(data);
        setAllMessages(prev => ({ ...prev, [userId]: data }));
      } catch (err) {
        console.error("Không tải được lịch sử chat", err);
        setMessages([]);
      }
    }
  };

  // Gửi tin nhắn
  const handleSend = () => {
    if (!input || !selectedUser) return;

    socket.emit("sendMessage", {
      toUserId: selectedUser,
      fromUserId: user.id,
      message: input,
      isAdminSender: true,
    });

    const newMessage = { from: "admin", text: input };
    setMessages(prev => [...prev, newMessage]);
    setAllMessages(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), newMessage]
    }));
    setInput("");
  };

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card style={{ height: "85vh", borderRadius: "15px", display: "flex", flexDirection: "column" }} className="m-3 shadow">
      <div className="d-flex h-100">
        {/* Danh sách khách */}
        <ListGroup style={{ width: "250px", borderRight: "1px solid #ddd", overflowY: "auto" }}>
          {users.length > 0 ? users.map(u => (
            <ListGroup.Item
              key={u.id}
              action
              active={selectedUser === u.id}
              onClick={() => handleSelectUser(u.id)}
              className="d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center">
                <Image src="https://img.icons8.com/ios-filled/50/user-male-circle.png" roundedCircle style={{ width: 28, height: 28, marginRight: 8 }} />
                {u.full_name}
              </div>
              {notifications[u.id] > 0 && selectedUser !== u.id && (
                <Badge bg="danger" pill>{notifications[u.id]}</Badge>
              )}
            </ListGroup.Item>
          )) : (
            <ListGroup.Item className="text-muted">Không có khách hàng online</ListGroup.Item>
          )}
        </ListGroup>

        {/* Chat box */}
        <div className="flex-grow-1 d-flex flex-column">
          <div className="flex-grow-1 p-3" style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}>
            {selectedUser ? (
              messages.map((m, i) => (
                <div key={i} className={`d-flex mb-2 justify-content-${m.from === "admin" ? "end" : "start"}`}>
                  {m.from === "user" && <Image src="https://img.icons8.com/ios-filled/50/user-male-circle.png" roundedCircle style={{ width: 28, height: 28, marginRight: 8 }} />}
                  <div className={`p-2 rounded shadow-sm`} style={{
                    maxWidth: "70%",
                    backgroundColor: m.from === "admin" ? "#6f42c1" : "#e9ecef",
                    color: m.from === "admin" ? "#fff" : "#000",
                    borderRadius: m.from === "admin" ? "15px 15px 0 15px" : "15px 15px 15px 0"
                  }}>
                    {m.text}
                  </div>
                  {m.from === "admin" && <Image src="https://img.icons8.com/color/48/admin-settings-male.png" roundedCircle style={{ width: 28, height: 28, marginLeft: 8 }} />}
                </div>
              ))
            ) : (
              <p className="text-muted text-center mt-3">Chọn khách hàng để bắt đầu trò chuyện</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedUser && (
            <InputGroup className="p-2 border-top">
              <Form.Control
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                style={{ borderRadius: "20px" }}
              />
              <Button variant="primary" onClick={handleSend} style={{ borderRadius: "20px", marginLeft: "5px" }}>Gửi</Button>
            </InputGroup>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdminChat;
