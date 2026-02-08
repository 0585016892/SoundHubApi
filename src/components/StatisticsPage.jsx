import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Typography, ConfigProvider, theme, Space, Statistic, Divider } from "antd";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { 
  DashboardOutlined, StockOutlined, ShoppingCartOutlined, 
  UserOutlined, BoxPlotOutlined, ArrowUpOutlined, TrophyOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getRevenue, getTopProducts, getCustomers, getLowStock, getCoupons
} from "../api/statisApi";

const { Title, Text } = Typography;

/* ================= STYLING CONSTANTS ================= */
const COLORS = ["#ff6600", "#FFD93D", "#6BCB77", "#4D96FF", "#9B5DE5"];
const STATUS_COLORS = {
  pending: "#FFD93D",
  shipped: "#4D96FF",
  delivered: "#6BCB77",
  canceled: "#FF6B6B"
};

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customers, setCustomers] = useState({ newCustomers: 0, topCustomers: [] });
  const [stockData, setStockData] = useState([]);
  const [couponData, setCouponData] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [rev, prod, cust, stock, coupon] = await Promise.all([
        getRevenue("day"),
        getTopProducts(),
        getCustomers(),
        getLowStock(10),
        getCoupons()
      ]);
      setRevenueData(rev || []);
      setTopProducts(prod || []);
      setCustomers(cust || { newCustomers: 0, topCustomers: [] });
      setStockData(stock || []);
      setCouponData(coupon || []);
    } catch (err) {
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "150px 0", background: "#050505", minHeight: "100vh" }}>
        <Spin size="large" tip={<span style={{ color: '#ff6600' }}>Hệ thống đang trích xuất dữ liệu âm thanh...</span>} />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorBgContainer: "#111", colorPrimary: "#ff6600", borderRadius: 16 }
      }}
    >
      <div style={{ background: "#050505", minHeight: "100vh", padding: "30px 50px" }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <Space direction="vertical" size={0}>
            <Title level={2} style={{ margin: 0, letterSpacing: 1.5 }}>SOUNDHUB ANALYTICS</Title>
            <Text type="secondary">Chào mừng trở lại, Admin. Đây là hiệu suất hôm nay.</Text>
          </Space>
          <div className="status-badge">● LIVE SYSTEM</div>
        </div>

        {/* QUICK STATS CARDS */}
        <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
          <Col span={6}>
            <StatCard title="Tổng doanh thu" value="128.5M" icon={<StockOutlined />} color="#ff6600" trend="+12%" />
          </Col>
          <Col span={6}>
            <StatCard title="Đơn hàng mới" value="48" icon={<ShoppingCartOutlined />} color="#6BCB77" trend="+5%" />
          </Col>
          <Col span={6}>
            <StatCard title="Khách hàng" value={customers.topCustomers.length} icon={<UserOutlined />} color="#4D96FF" trend="+2%" />
          </Col>
          <Col span={6}>
            <StatCard title="Tồn kho thấp" value={stockData.length} icon={<BoxPlotOutlined />} color="#FFD93D" trend="Cần chú ý" isWarning />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* MAIN REVENUE CHART */}
          <Col span={16}>
            <GlassCard title="Biểu đồ tăng trưởng doanh thu">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6600" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff6600" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="period" stroke="#555" tick={{fontSize: 12}} />
                  <YAxis stroke="#555" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 8 }}
                    itemStyle={{ color: '#ff6600' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ff6600" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </Col>

          {/* TOP CUSTOMERS LIST */}
          <Col span={8}>
            <GlassCard title="Khách hàng tiêu biểu" icon={<TrophyOutlined style={{color: '#FFD93D'}} />}>
              <div style={{ height: 350, overflowY: 'auto' }}>
                {customers.topCustomers.map((c, idx) => (
                  <div key={idx} className="customer-item">
                    <Space size={15}>
                      <div className="rank-circle">{idx + 1}</div>
                      <Space direction="vertical" size={0}>
                        <Text strong>{c.full_name}</Text>
                        <Text type="secondary" style={{fontSize: 12}}>{c.total_orders} đơn hàng</Text>
                      </Space>
                    </Space>
                    <Text style={{ color: '#ff6600' }}>Active</Text>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Col>

          {/* BEST SELLERS & STOCK WARNING */}
          <Col span={12}>
            <GlassCard title="Top sản phẩm bán chạy">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#555" />
                  <Tooltip cursor={{fill: 'rgba(255,102,0,0.1)'}} contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                  <Bar dataKey="sold_quantity" fill="#ff6600" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </Col>

          <Col span={12}>
            <GlassCard title="Phân bổ mã giảm giá">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={couponData} dataKey="remaining" nameKey="code" innerRadius={60} outerRadius={100} paddingAngle={5}>
                    {couponData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </Col>
        </Row>

        <style>{`
          .status-badge {
            background: rgba(107, 203, 119, 0.1);
            color: #6BCB77;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid rgba(107, 203, 119, 0.3);
          }
          .customer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #222;
          }
          .rank-circle {
            width: 30px;
            height: 30px;
            background: #222;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #ff6600;
          }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

/* ================= HELPER COMPONENTS ================= */

const StatCard = ({ title, value, icon, color, trend, isWarning }) => (
  <Card style={{ background: '#111', border: '1px solid #222' }} bodyStyle={{ padding: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
      <div style={{ padding: 10, background: `${color}20`, borderRadius: 12, color: color, fontSize: 20 }}>
        {icon}
      </div>
      <Text style={{ color: isWarning ? '#FF6B6B' : '#6BCB77', fontSize: 12 }}>
        {!isWarning && <ArrowUpOutlined />} {trend}
      </Text>
    </div>
    <Statistic title={<Text type="secondary" style={{fontSize: 13}}>{title}</Text>} value={value} valueStyle={{ color: '#fff', fontWeight: 800 }} />
  </Card>
);

const GlassCard = ({ title, children, icon }) => (
  <Card 
    title={<Space>{icon} <span style={{fontSize: 14, letterSpacing: 1}}>{title.toUpperCase()}</span></Space>}
    bordered={false}
    style={{ background: '#111', border: '1px solid #222', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
    headStyle={{ borderBottom: '1px solid #222', padding: '0 25px' }}
    bodyStyle={{ padding: 25 }}
  >
    {children}
  </Card>
);

export default StatisticsPage;