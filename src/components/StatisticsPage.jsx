import React, { useEffect, useState } from "react";
import { Card, Tabs, Row, Col, Spin, Typography } from "antd";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import toast from "react-hot-toast";
import {
  getRevenue,
  getTopProducts,
  getCustomers,
  getLowStock,
  getCoupons
} from "../api/statisApi";

const { Title } = Typography;

/* ================= CONSTANT ================= */
const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9B5DE5"];
const STATUS_COLORS = {
  pending: "#FFD93D",
  shipped: "#4D96FF",
  delivered: "#6BCB77",
  canceled: "#FF6B6B"
};

/* ================= COMPONENT ================= */
const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);

  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customers, setCustomers] = useState({ newCustomers: 0, topCustomers: [] });
  const [stockData, setStockData] = useState([]);
  const [couponData, setCouponData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

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

      setOrderStatusData([
        { status: "pending", value: 12 },
        { status: "shipped", value: 25 },
        { status: "delivered", value: 40 },
        { status: "canceled", value: 5 }
      ]);

    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: 24 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
        📊 Dashboard thống kê hệ thống
      </Title>

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Tabs
          centered
          size="large"
          items={[
            {
              key: "revenue",
              label: "📈 Doanh thu",
              children: (
                <ChartCard title="Doanh thu theo ngày">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="revenue" stroke="#FF6B6B" strokeWidth={3} dot={false} />
                  </LineChart>
                </ChartCard>
              )
            },

            {
              key: "products",
              label: "📦 Sản phẩm",
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <ChartCard title="Top sản phẩm bán chạy">
                      <BarChart data={topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sold_quantity" fill="#FFD93D" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartCard>
                  </Col>

                  <Col span={12}>
                    <ChartCard title="Sản phẩm tồn kho thấp">
                      <BarChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name_variant" angle={-30} textAnchor="end" interval={0} height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="stock" fill="#4D96FF" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartCard>
                  </Col>
                </Row>
              )
            },

            {
              key: "customers",
              label: "👥 Khách hàng",
              children: (
                <ChartCard title="Top khách hàng">
                  <BarChart data={customers.topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="full_name" angle={-30} textAnchor="end" interval={0} height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_orders" fill="#6BCB77" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartCard>
              )
            },

            {
              key: "coupons",
              label: "🎟 Coupon",
              children: (
                <ChartCard title="Coupon còn lại">
                  <PieChart>
                    <Pie data={couponData} dataKey="remaining" nameKey="code" outerRadius={120} label>
                      {couponData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartCard>
              )
            },

            {
              key: "orders",
              label: "🚚 Đơn hàng",
              children: (
                <ChartCard title="Trạng thái đơn hàng">
                  <PieChart>
                    <Pie data={orderStatusData} dataKey="value" nameKey="status" outerRadius={120} label>
                      {orderStatusData.map((i, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[i.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartCard>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

/* ================= SUB COMPONENT ================= */
const ChartCard = ({ title, children }) => (
  <Card
    bordered={false}
    style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
  >
    <Title level={5}>{title}</Title>
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  </Card>
);

export default StatisticsPage;
