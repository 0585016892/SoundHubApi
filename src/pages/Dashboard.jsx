import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Typography, ConfigProvider } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  BoxPlotOutlined,
  ArrowUpOutlined,
  SoundOutlined
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
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

const { Title, Text } = Typography;

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
    shipping: "cyan",
    completed: "#52c41a",
    canceled: "#ff4d4f",
  };

  const infoCardList = [
    { title: "Khách hàng", value: infoCards.customers, icon: <UserOutlined />, color: "#ff6600" },
    { title: "Đơn hàng", value: infoCards.orders, icon: <ShoppingCartOutlined />, color: "#ff6600" },
    { title: "Mã giảm giá", value: infoCards.coupons, icon: <TagsOutlined />, color: "#ff6600" },
    { title: "Sản phẩm", value: infoCards.products, icon: <BoxPlotOutlined />, color: "#ff6600" },
  ];

  const pieColors = ["#ff6600", "#ff944d", "#cc5200", "#ffd1b3", "#4d1f00"];

  const columns = [
    { title: "MÃ ĐƠN", dataIndex: "id", key: "id", render: (text) => <Text style={{ color: "#ff6600", fontWeight: "bold" }}>#{text}</Text> },
    { title: "KHÁCH HÀNG", dataIndex: "customer", key: "customer" },
    {
      title: "TỔNG TIỀN",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => <Text strong style={{ color: "#fff" }}>{Number(val).toLocaleString()} ₫</Text>,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => (
        <Tag color={statusColor[status]} style={{ borderRadius: '4px', textTransform: 'uppercase', fontSize: '10px' }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: "#141414", colorText: "#fff", colorTextHeading: "#fff" },
      }}
    >
      <div style={{ paddingBottom: 40 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            <SoundOutlined style={{ color: "#ff6600", marginRight: 12 }} />
            Tổng quan hệ thống
          </Title>
          <Text type="secondary">Cập nhật dữ liệu âm thanh realtime</Text>
        </div>

        {/* Info Cards - Kính mờ Dark Mode */}
        <Row gutter={[20, 20]}>
          {infoCardList.map((card, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card
                bordered={false}
                style={{
                  background: "#141414",
                  borderRadius: 16,
                  border: "1px solid #222",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <Statistic
                  title={<Text style={{ color: "#888", textTransform: "uppercase", fontSize: 12 }}>{card.title}</Text>}
                  value={card.value || 0}
                  valueStyle={{ color: "#fff", fontWeight: 800, fontSize: 32 }}
                  prefix={card.icon}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="rgba(82, 196, 26, 0.1)" style={{ color: "#52c41a", border: "none" }}>
                    <ArrowUpOutlined /> 12%
                  </Tag>
                  <Text style={{ color: "#444", fontSize: 12 }}>so với tháng trước</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Biểu đồ - AreaChart Neon */}
        <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card 
              title="Phân tích Doanh thu & Đơn hàng" 
              bordered={false} 
              style={{ borderRadius: 16, background: "#141414", border: "1px solid #222" }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={ordersData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6600" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff6600" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#444" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ background: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                    itemStyle={{ color: "#ff6600" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ff6600" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              title="Tỷ trọng thiết bị" 
              bordered={false} 
              style={{ borderRadius: 16, background: "#141414", border: "1px solid #222" }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie 
                    data={productCategories} 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {productCategories.map((entry, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: -20 }}>
                <Text type="secondary">Top 5 danh mục bán chạy</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Bảng đơn hàng gần đây */}
        <Card 
          title="Giao dịch mới nhất" 
          bordered={false} 
          style={{ marginTop: 24, borderRadius: 16, background: "#141414", border: "1px solid #222" }}
          bodyStyle={{ padding: 0 }}
        >
          <Table 
            columns={columns} 
            dataSource={recentOrders} 
            rowKey="id" 
            pagination={false}
            className="dark-table"
          />
        </Card>

        <style>{`
          .dark-table .ant-table { background: transparent !important; color: #fff !important; }
          .dark-table .ant-table-thead > tr > th { 
            background: #1a1a1a !important; 
            color: #888 !important; 
            border-bottom: 1px solid #222 !important;
            font-size: 11px;
            letter-spacing: 1px;
          }
          .dark-table .ant-table-tbody > tr > td { border-bottom: 1px solid #222 !important; }
          .dark-table .ant-table-tbody > tr:hover > td { background: #1f1f1f !important; }
          .ant-card-head { border-bottom: 1px solid #222 !important; min-height: 50px !important; }
          .ant-card-head-title { font-size: 16px !important; font-weight: 600 !important; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Dashboard; 