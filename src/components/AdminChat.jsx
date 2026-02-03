import React, { useState, useEffect, useRef, useContext } from "react";
import { Layout, List, Avatar, Badge, Input, Button, Card, Typography } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import socket from "../utils/socket";
import { UserContext } from "../context/UserContext";

const { Sider, Content } = Layout;
const { Text } = Typography;

const AdminChat = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages, setAllMessages] = useState({});
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // SOCKET CONNECT
  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("join", { userId: user.id, isAdmin: true });

    socket.on("updateOnlineUsers", (onlineCustomers) => {
      setUsers(onlineCustomers);
    });

    socket.on("receiveMessage", ({ fromUserId, message }) => {
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
      socket.disconnect();
    };
  }, [user, selectedUser]);

  // LOAD CHAT HISTORY
  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    setNotifications(prev => ({ ...prev, [userId]: 0 }));

    if (allMessages[userId]) {
      setMessages(allMessages[userId]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/chat/history/${userId}`);
      const data = await res.json();
      setMessages(data);
      setAllMessages(prev => ({ ...prev, [userId]: data }));
    } catch {
      setMessages([]);
    }
  };

  // SEND MESSAGE
  const handleSend = () => {
    if (!input || !selectedUser) return;

    socket.emit("sendMessage", {
      toUserId: selectedUser,
      fromUserId: user.id,
      message: input,
      isAdminSender: true,
    });

    const newMsg = { from: "admin", text: input };
    setMessages(prev => [...prev, newMsg]);
    setAllMessages(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), newMsg]
    }));

    setInput("");
  };

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Layout style={{ height: "90vh", borderRadius: 12, overflow: "hidden", boxShadow: "0 5px 20px rgba(0,0,0,0.1)" }}>

      {/* SIDEBAR USERS */}
      <Sider width={280} theme="light" style={{ borderRight: "1px solid #eee" }}>
        <div style={{ padding: 15, fontWeight: 600, fontSize: 16 }}>👥 Khách hàng Online</div>

        <List
          dataSource={users}
          renderItem={(u) => (
            <List.Item
              onClick={() => handleSelectUser(u.id)}
              style={{
                cursor: "pointer",
                background: selectedUser === u.id ? "#e6f4ff" : "transparent",
                padding: 12
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={notifications[u.id]}>
                    <Avatar icon={<UserOutlined />} />
                  </Badge>
                }
                title={<b>{u.full_name}</b>}
              />
            </List.Item>
          )}
        />
      </Sider>

      {/* CHAT CONTENT */}
      <Content style={{ display: "flex", flexDirection: "column", background: "#f5f7fa" }}>
        
        {/* MESSAGE AREA */}
        <div style={{ flex: 1, padding: 15, overflowY: "auto" }}>
          {!selectedUser && (
            <Text type="secondary">👉 Chọn khách hàng để bắt đầu chat</Text>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "admin" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <Card
                size="small"
                style={{
                  maxWidth: "60%",
                  background: m.from === "admin" ? "#1677ff" : "#fff",
                  color: m.from === "admin" ? "#fff" : "#000",
                  borderRadius: m.from === "admin" ? "16px 16px 0 16px" : "16px 16px 16px 0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                {m.text}
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div style={{ padding: 12, borderTop: "1px solid #ddd", background: "#fff", display: "flex" }}>
            <Input
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={handleSend}
              style={{ borderRadius: 20, marginRight: 10 }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
          </div>
        )}

      </Content>
    </Layout>
  );
};

export default AdminChat;
