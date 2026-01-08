// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Table } from "react-bootstrap";
import { FaUsers, FaShoppingCart, FaTags, FaBoxOpen } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

const Dashboard = () => {
  const [infoCards, setInfoCards] = useState({});
  const [ordersData, setOrdersData] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard")
      .then(res => {
        setInfoCards(res.data.infoCards);
        setOrdersData(res.data.ordersData);
        setProductCategories(res.data.productCategories);
        setRecentOrders(res.data.recentOrders);
      })
      .catch(err => console.log(err));
  }, []);

  const statusColor = {
    pending: "warning",
    shipping: "info",
    completed: "success",
    canceled: "danger"
  };

  const infoCardList = [
    { title: "Khách hàng", value: infoCards.customers, icon: FaUsers, bg: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" },
    { title: "Đơn hàng", value: infoCards.orders, icon: FaShoppingCart, bg: "linear-gradient(135deg, #33a06a 0%, #6adf9a 100%)" },
    { title: "Mã giảm giá", value: infoCards.coupons, icon: FaTags, bg: "linear-gradient(135deg, #ff7f50 0%, #ffa07a 100%)" },
    { title: "Sản phẩm", value: infoCards.products, icon: FaBoxOpen, bg: "linear-gradient(135deg, #ffcc00 0%, #ffd700 100%)" },
  ];

  const pieColors = ["#33a06a", "#ff7f50", "#6a11cb", "#ffd700", "#2575fc"];

  return (
    <div className="dashboard-page">
      <h3 className="mb-4 fw-bold">Dashboard</h3>

      {/* Info Cards */}
      <Row className="mb-4 g-3">
        {infoCardList.map((card, i) => {
          const Icon = card.icon;
          return (
            <Col md={3} key={i}>
              <Card className="shadow-sm border-0 hover-card" style={{ borderRadius: "12px", overflow: "hidden", transition: 'transform 0.2s' }}>
                <Card.Body className="d-flex align-items-center gap-3" style={{ background: card.bg, color: "#fff", height: "110px" }}>
                  <div>
                    <Icon size={40} />
                  </div>
                  <div>
                    <Card.Title className="mb-1 fw-bold">{card.title}</Card.Title>
                    <Card.Text className="h4 mb-0 fw-bold">{card.value}</Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Charts */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
            <Card.Header className="fw-bold bg-white border-0">Đơn hàng theo ngày</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#33a06a" strokeWidth={3} name="Số đơn" />
                  <Line type="monotone" dataKey="revenue" stroke="#ff7f50" strokeWidth={3} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
            <Card.Header className="fw-bold bg-white border-0">Phân loại sản phẩm</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {productCategories.map((entry, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <Card.Header className="fw-bold bg-white border-0">Đơn hàng gần đây</Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle table-dashboard">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{Number(order.total_amount).toLocaleString()} VNĐ</td>
                  <td>
                    <Badge bg={statusColor[order.order_status]} pill className="px-2 py-1">
                      {order.order_status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
