import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Typography,
  ConfigProvider,
  theme,
  Space,
  Button,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  BoxPlotOutlined,
  ArrowUpOutlined,
  SoundOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  CalendarOutlined,
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
import { motion } from "framer-motion";
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
    pending: { color: "#faad14", bg: "rgba(250, 173, 20, 0.1)" },
    shipping: { color: "#1890ff", bg: "rgba(24, 144, 255, 0.1)" },
    completed: { color: "#52c41a", bg: "rgba(82, 196, 26, 0.1)" },
    cancelled: { color: "#ff4d4f", bg: "rgba(255, 77, 79, 0.1)" },
  };

  const infoCardList = [
    {
      title: "KHÁCH HÀNG",
      value: infoCards.customers,
      icon: <UserOutlined />,
      trend: "+12%",
    },
    {
      title: "ĐƠN HÀNG",
      value: infoCards.orders,
      icon: <ShoppingCartOutlined />,
      trend: "+5.4%",
    },
    {
      title: "MÃ GIẢM GIÁ",
      value: infoCards.coupons,
      icon: <TagsOutlined />,
      trend: "0%",
    },
    {
      title: "SẢN PHẨM",
      value: infoCards.products,
      icon: <BoxPlotOutlined />,
      trend: "+2.1%",
    },
  ];

  const pieColors = ["#ff6600", "#ff8533", "#b34700", "#4d1f00", "#331400"];

  const columns = [
    {
      title: "MÃ ĐƠN",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text className="order-id-txt">#{text}</Text>,
    },
    {
      title: "KHÁCH HÀNG",
      dataIndex: "customer",
      key: "customer",
      render: (name) => (
        <Text style={{ color: "#fff", fontWeight: 500 }}>{name}</Text>
      ),
    },
    {
      title: "TỔNG TIỀN",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val) => (
        <Text className="amount-txt">{Number(val).toLocaleString()} ₫</Text>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => (
        <span
          className="custom-status-pill"
          style={{
            color: statusColor[status]?.color,
            background: statusColor[status]?.bg,
          }}
        >
          ●{" "}
          {status?.toUpperCase() === "PENDING"
            ? "Đang xử lý"
            : status?.toUpperCase() === "SHIPPING"
              ? "Đang giao hàng"
              : status?.toUpperCase() === "COMPLETED"
                ? "Hoàn thành"
                : status?.toUpperCase() === "CANCELLED"
                  ? "Đã hủy"
                  : status}
        </span>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "#111111",
          colorText: "#ffffff",
          colorPrimary: "#ff6600",
        },
      }}
    >
      <div className="dashboard-container">
        {/* HEADER SECTION */}
        <div className="dashboard-header">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} className="m-0 page-title">
                <SoundOutlined className="title-icon" /> TCD AUDIO QUẢN TRỊ
              </Title>
              <Text className="text-secondary uppercase-tracking">
                Dữ liệu hợp nhất thời gian thực • 2026
              </Text>
            </Col>
          </Row>
        </div>

        {/* STATS BENTO GRID */}
        <Row gutter={[20, 20]} className="mt-6">
          {infoCardList.map((card, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card bordered={false} className="bento-card stat-card">
                  <div className="stat-icon-wrapper">{card.icon}</div>
                  <Statistic
                    title={<Text className="stat-label">{card.title}</Text>}
                    value={card.value || 0}
                    valueStyle={{
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 28,
                      letterSpacing: -1,
                    }}
                  />
                  <div className="stat-footer">
                    <Text className="trend-positive">
                      <ArrowUpOutlined /> {card.trend}
                    </Text>
                    <Text className="stat-sub-label">vs kỳ trước</Text>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* CHARTS SECTION */}
        <Row gutter={[20, 20]} className="mt-6">
          <Col xs={24} lg={16}>
            <Card
              title={
                <>
                  <ThunderboltOutlined style={{ color: "#ff6600" }} /> HIỆU SUẤT
                  DOANH THU
                </>
              }
              bordered={false}
              className="bento-card chart-main"
            >
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={ordersData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="neonGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ff6600"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ff6600"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1a1a1a"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#333"
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#333"
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#080808",
                        border: "1px solid #fff",
                        borderRadius: 12,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      itemStyle={{ color: "#ff6600", fontWeight: 800 }}
                    />
                    <Area
                      type="smooth"
                      dataKey="revenue"
                      stroke="#ff6600"
                      strokeWidth={4}
                      fill="url(#neonGradient)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="CƠ CẤU THIẾT BỊ"
              bordered={false}
              className="bento-card chart-pie"
            >
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={productCategories}
                      innerRadius={85}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {productCategories.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-center-label">
                <Title level={4} className="m-0" style={{ color: "#ff6600" }}>
                  Top 5
                </Title>
                <Text className="text-secondary" style={{ fontSize: 10 }}>
                  DANH MỤC
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* RECENT ORDERS TABLE */}
        <Card
          title="GIAO DỊCH NỘI BỘ GẦN ĐÂY"
          bordered={false}
          className="bento-card mt-6 table-container"
          extra={
            <Button type="link" style={{ color: "#ff6600", fontWeight: 700 }}>
              Xem tất cả
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="id"
            pagination={false}
            className="modern-dark-table"
          />
        </Card>

        <style>{`
          .dashboard-container { padding: 30px; background: #080808; min-height: 100vh; font-family: 'Inter', sans-serif; }
          .mt-6 { margin-top: 24px; }
          .m-0 { margin: 0 !important; }
          
          /* Typography */
          .page-title { font-weight: 900 !important; letter-spacing: -1.5px; color: #fff !important; }
          .title-icon { color: #ff6600; margin-right: 15px; filter: drop-shadow(0 0 10px rgba(255,102,0,0.5)); }
          .uppercase-tracking { text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #fff !important; }

          /* Bento Cards */
          .bento-card { background: #111111 !important; border: 1px solid #1a1a1a !important; border-radius: 20px !important; overflow: hidden; }
          .stat-card { padding: 5px; position: relative; }
          .stat-icon-wrapper { position: absolute; right: 20px; top: 20px; font-size: 24px; color: #fff; }
          .stat-label { font-size: 10px; font-weight: 800; color: #dcdcdc !important; letter-spacing: 1px; }
          .stat-footer { margin-top: 15px; display: flex; align-items: center; gap: 8px; }
          .trend-positive { color: #52c41a; font-weight: 800; font-size: 12px; }
          .stat-sub-label { color: #333; font-size: 11px; }

          /* Buttons */
          .btn-secondary-dark { background: #1a1a1a !important; border: 1px solid #fff !important; color: #fff !important; border-radius: 8px !important; }
          .btn-glow-primary { background: #ff6600 !important; border: none !important; font-weight: 800 !important; border-radius: 8px !important; box-shadow: 0 4px 15px rgba(255,102,0,0.3) !important; }

          /* Table Styling */
          .modern-dark-table .ant-table { background: transparent !important; }
          .modern-dark-table .ant-table-thead > tr > th { 
            background: #161616 !important; 
            color: #fff !important; 
            font-size: 10px !important; 
            font-weight: 800 !important; 
            text-transform: uppercase;
            border-bottom: 1px solid #1a1a1a !important;
            padding: 16px 24px !important;
          }
          .modern-dark-table .ant-table-tbody > tr > td { 
            border-bottom: 1px solid #161616 !important; 
            padding: 16px 24px !important;
          }
          .modern-dark-table .ant-table-tbody > tr:hover > td { background: #151515 !important; }
          
          .order-id-txt { color: #ff6600 !important; font-family: 'Space Mono', monospace; font-weight: 700; }
          .amount-txt { color: #ffffff !important; font-weight: 700; }
          
          .custom-status-pill {
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          /* Pie Chart Center Label */
          .chart-pie { position: relative; }
          .pie-center-label {
            position: absolute;
            top: 58%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          }

          /* Responsive Scrollbar */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #080808; }
          ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #fff; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Dashboard;
