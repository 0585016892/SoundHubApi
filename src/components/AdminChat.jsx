  import React, { useState, useEffect, useRef, useContext } from "react";
  import { Layout, List, Avatar, Badge, Input, Button, Card, Typography, ConfigProvider, theme, Space } from "antd";
  import { SendOutlined, UserOutlined, MessageOutlined, CustomerServiceOutlined, RobotOutlined } from "@ant-design/icons";
  import socket from "../utils/socket";
  import { UserContext } from "../context/UserContext";

  const { Sider, Content } = Layout;
  const { Text, Title } = Typography;

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

    /* ================= SOCKET CONNECT ================= */
    useEffect(() => {
      if (!user) return;

      socket.connect();
      socket.emit("join", { userId: user.id, isAdmin: true });

      socket.on("updateOnlineUsers", (onlineCustomers) => {
        setUsers(onlineCustomers);
      });

      socket.on("receiveMessage", ({ fromUserId, message }) => {
        const msgObj = { from: "user", text: message, time: new Date() };
        
        setAllMessages(prev => ({
          ...prev,
          [fromUserId]: [...(prev[fromUserId] || []), msgObj]
        }));

        if (fromUserId === selectedUser) {
          setMessages(prev => [...prev, msgObj]);
        } else {
          setNotifications(prev => ({ ...prev, [fromUserId]: (prev[fromUserId] || 0) + 1 }));
        }
      });

      return () => {
        socket.disconnect();
      };
    }, [user, selectedUser]);
  console.log();

    /* ================= LOAD CHAT HISTORY ================= */
    const handleSelectUser = async (customer) => {
      setSelectedUser(customer.id);
      setNotifications(prev => ({ ...prev, [customer.id]: 0 }));

      if (allMessages[customer.id]) {
        setMessages(allMessages[customer.id]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/chat/history/${customer.id}`);
        const data = await res.json();
        setMessages(data);
        setAllMessages(prev => ({ ...prev, [customer.id]: data }));
      } catch {
        setMessages([]);
      }
    };

    /* ================= SEND MESSAGE ================= */
    const handleSend = () => {
      if (!input.trim() || !selectedUser) return;

      socket.emit("sendMessage", {
        toUserId: selectedUser,
        fromUserId: user.id,
        message: input,
        isAdminSender: true,
      });

      const newMsg = { from: "admin", text: input, time: new Date() };
      setMessages(prev => [...prev, newMsg]);
      setAllMessages(prev => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), newMsg]
      }));

      setInput("");
    };

    /* ================= AUTO SCROLL ================= */
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: { colorBgContainer: "#141414", colorPrimary: "#ff6600", colorBorder: "#222" }
        }}
      >
        <Layout style={{ height: "85vh", borderRadius: 16, overflow: "hidden", background: "#0a0a0a", border: "1px solid #222" }}>
          
          {/* SIDEBAR: ONLINE USERS */}
          <Sider width={320} style={{ background: "#141414", borderRight: "1px solid #222" }}>
            <div style={{ padding: "20px 15px", borderBottom: "1px solid #222" }}>
              <Title level={4} style={{ color: "#fff", margin: 0, fontSize: 16 }}>
                <CustomerServiceOutlined style={{ color: "#ff6600", marginRight: 8 }} />
                KHÁCH HÀNG ONLINE
              </Title>
            </div>

            <List
              dataSource={users}
              style={{ padding: 8 }}
              renderItem={(u) => (
                <List.Item
                  onClick={() => handleSelectUser(u)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 12,
                    marginBottom: 4,
                    padding: "12px 15px",
                    transition: "all 0.3s",
                    background: selectedUser === u.id ? "rgba(255, 102, 0, 0.1)" : "transparent",
                    border: selectedUser === u.id ? "1px solid rgba(255, 102, 0, 0.3)" : "1px solid transparent",
                  }}
                  className="user-item"
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={notifications[u.id]} offset={[-2, 32]}>
                        <Avatar 
                          src={u.avatar} 
                          icon={<UserOutlined />} 
                          style={{ border: selectedUser === u.id ? "2px solid #ff6600" : "2px solid #333" }}
                        />
                      </Badge>
                    }
                    title={<Text style={{ color: selectedUser === u.id ? "#ff6600" : "#fff", fontWeight: 600 }}>{u.full_name}</Text>}
                    description={<Text style={{ color: "#555", fontSize: 12 }}>Đang trực tuyến</Text>}
                  />
                </List.Item>
              )}
            />
          </Sider>

          {/* CHAT MAIN CONTENT */}
          <Content style={{ display: "flex", flexDirection: "column", background: "#0f0f0f" }}>
            
            {selectedUser ? (
              <>
                {/* CHAT HEADER */}
                <div style={{ padding: "15px 25px", background: "#141414", borderBottom: "1px solid #222", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                      <Avatar icon={<UserOutlined />} style={{ background: '#333' }} />
                      <div>
                          <Text style={{ color: '#fff', fontWeight: 'bold', display: 'block' }}>Hỗ trợ khách hàng</Text>
                          <Text style={{ color: '#52c41a', fontSize: 11 }}>● Đang kết nối</Text>
                      </div>
                  </Space>
                  <MessageOutlined style={{ color: '#333', fontSize: 20 }} />
                </div>

                {/* MESSAGES AREA */}
                <div style={{ flex: 1, padding: "20px 25px", overflowY: "auto", display: 'flex', flexDirection: 'column' }}>
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      style={{ 
                          alignSelf: m.from === "admin" ? "flex-end" : "flex-start", 
                          marginBottom: 16,
                          maxWidth: "70%"
                      }}
                    >
                      <div style={{ 
                          padding: "10px 16px", 
                          borderRadius: m.from === "admin" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                          background: m.from === "admin" ? "linear-gradient(135deg, #ff6600 0%, #e65c00 100%)" : "#1a1a1a",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                      }}>
                        <Text style={{ color: m.from === "admin" ? "#fff" : "#eee" }}>{m.text}</Text>
                      </div>
                      <Text style={{ fontSize: 10, color: "#444", marginTop: 4, display: 'block', textAlign: m.from === "admin" ? "right" : "left" }}>
                        {m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </Text>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* CHAT INPUT */}
                <div style={{ padding: 20, background: "#141414", borderTop: "1px solid #222" }}>
                  <div style={{ display: 'flex', background: '#0a0a0a', padding: '4px 8px', borderRadius: 25, border: '1px solid #333' }}>
                      <Input
                          variant="borderless"
                          placeholder="Viết phản hồi cho khách hàng..."
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onPressEnter={handleSend}
                          style={{ color: '#fff', flex: 1 }}
                      />
                      <Button 
                          type="primary" 
                          shape="circle" 
                          icon={<SendOutlined />} 
                          onClick={handleSend}
                          style={{ background: '#ff6600', border: 'none' }}
                      />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <RobotOutlined style={{ fontSize: 60, color: '#222', marginBottom: 20 }} />
                  <Title level={4} style={{ color: '#333' }}>TRUNG TÂM PHẢN HỒI AUDIOPHILE</Title>
                  <Text style={{ color: '#444' }}>Vui lòng chọn một khách hàng từ danh sách bên trái để bắt đầu hỗ trợ.</Text>
              </div>
            )}

          </Content>
        </Layout>

        <style>{`
          .user-item:hover { background: rgba(255, 255, 255, 0.05) !important; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #333; }
          .ant-badge-count { background: #ff6600 !important; box-shadow: 0 0 0 1px #000 !important; }
        `}</style>
      </ConfigProvider>
    );
  };

  export default AdminChat;