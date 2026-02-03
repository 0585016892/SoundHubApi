// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Table, Tag } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

const Dashboard = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [infoCards, setInfoCards] = useState({});
  const [ordersData, setOrdersData] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/dashboard`)
      .then((res) => {
        setInfoCards(res.data.infoCards);
        setOrdersData(res.data.ordersData);
        setProductCategories(res.data.productCategories);
        setRecentOrders(res.data.recentOrders);
      })
      .catch((err) => console.log(err));
  }, []);

  const statusColor = {
    pending: "orange",
    shipping: "blue",
    completed: "green",
    canceled: "red",
  };

// Info Cards PRO
const infoCardList = [
  {
    title: "Khách hàng",
    value: infoCards.customers || 0,
    icon: <UserOutlined />,
    bg: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  {
    title: "Đơn hàng",
    value: infoCards.orders || 0,
    icon: <ShoppingCartOutlined />,
    bg: "linear-gradient(135deg, #43cea2, #185a9d)",
  },
  {
    title: "Mã giảm giá",
    value: infoCards.coupons || 0,
    icon: <TagsOutlined />,
    bg: "linear-gradient(135deg, #ff512f, #dd2476)",
  },
  {
    title: "Sản phẩm",
    value: infoCards.products || 0,
    icon: <BoxPlotOutlined />,
    bg: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
];


  const pieColors = ["#33a06a", "#ff7f50", "#6a11cb", "#ffd700", "#2575fc"];

  // Table columns
  const columns = [
    { title: "Mã đơn", dataIndex: "id", key: "id" },
    { title: "Khách hàng", dataIndex: "customer", key: "customer" },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => Number(val).toLocaleString() + " VNĐ",
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>📊 Dashboard</h2>

      {/* Info Cards */}
      <Row gutter={[20, 20]}>
  {infoCardList.map((card, i) => (
    <Col span={6} key={i}>
      <Card
        bordered={false}
        hoverable
        style={{
          borderRadius: 16,
          background: card.bg,
          color: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          transition: "0.3s",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>{card.title}</div>
            <div style={{ fontSize: 28, fontWeight: "bold" }}>{card.value}</div>
          </div>

          <div
            style={{
              fontSize: 36,
              background: "rgba(255,255,255,0.2)",
              padding: 12,
              borderRadius: "50%",
            }}
          >
            {card.icon}
          </div>
        </div>
      </Card>
    </Col>
  ))}
</Row>


      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Đơn hàng theo ngày" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#33a06a" strokeWidth={3} />
                <Line type="monotone" dataKey="revenue" stroke="#ff7f50" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Phân loại sản phẩm" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={productCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {productCategories.map((entry, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card title="Đơn hàng gần đây" bordered={false} style={{ marginTop: 20 }}>
        <Table columns={columns} dataSource={recentOrders} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default Dashboard;
