import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Tabs, Tab } from "react-bootstrap";
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
  const [tab, setTab] = useState("revenue");

  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customers, setCustomers] = useState({ newCustomers: 0, topCustomers: [] });
  const [stockData, setStockData] = useState([]);
  const [couponData, setCouponData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  /* ================= FETCH ================= */
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

      // Tạm thời giả lập trạng thái đơn hàng
      setOrderStatusData([
        { status: "pending", value: 12 },
        { status: "shipped", value: 25 },
        { status: "delivered", value: 40 },
        { status: "canceled", value: 5 }
      ]);

    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, i) => sum + i.revenue, 0);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div style={{ background: "#f4f6f8", minHeight: "100vh", padding: "30px 0" }}>
      <Container fluid>
        <h3 className="text-center fw-bold mb-4">Thống kê & báo cáo</h3>


        {/* ===== TABS ===== */}
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body>
            <Tabs activeKey={tab} onSelect={(k) => setTab(k)} className="mb-4 justify-content-center">

              {/* DOANH THU */}
              <Tab eventKey="revenue" title="📈 Doanh thu">
                <ChartCard title="Doanh thu theo ngày">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="revenue" stroke="#FF6B6B" strokeWidth={3} dot={false} />
                  </LineChart>
                </ChartCard>
              </Tab>

              {/* SAN PHAM */}
              <Tab eventKey="products" title="📦 Sản phẩm">
                  <Row className="g-4">

                    {/* TOP BAN CHAY */}
                    <Col md={6}>
                      <ChartCard title="Top sản phẩm bán chạy">
                        <BarChart data={topProducts}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-30}
                            textAnchor="end"
                            interval={0}
                            height={80}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="sold_quantity"
                            fill="#FFD93D"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ChartCard>
                    </Col>

                    {/* TON KHO THAP */}
                    <Col md={6}>
                      <ChartCard title="Sản phẩm tồn kho thấp">
                        <div style={{ width: "100%", height: 350 }}>
                          <ResponsiveContainer>
                            <BarChart
                              data={stockData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />

                              <XAxis
                                dataKey="name_variant"
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                              />

                              <YAxis />

                              <Tooltip />

                              <Bar
                                dataKey="stock"
                                fill="#4D96FF"
                                radius={[6, 6, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </ChartCard>
                    </Col>


                  </Row>
                </Tab>


              {/* KHACH HANG */}
            <Tab eventKey="customers" title="👥 Khách hàng">
              <ChartCard title="Top khách hàng">
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={customers.topCustomers}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="full_name"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="total_orders"
                        fill="#6BCB77"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </Tab>


              {/* COUPON */}
              <Tab eventKey="coupons" title="🎟 Coupon">
                <ChartCard title="Coupon còn lại">
                  <PieChart>
                    <Pie data={couponData} dataKey="remaining" nameKey="code" outerRadius={100} label>
                      {couponData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartCard>
              </Tab>

              {/* DON HANG */}
              <Tab eventKey="orders" title="🚚 Đơn hàng">
                <ChartCard title="Trạng thái đơn hàng">
                  <PieChart>
                    <Pie data={orderStatusData} dataKey="value" nameKey="status" outerRadius={100} label>
                      {orderStatusData.map((i, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[i.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartCard>
              </Tab>

            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

/* ================= SUB COMPONENT ================= */


const ChartCard = ({ title, children }) => (
  <Card className="shadow-sm border-0 rounded-4">
    <Card.Body>
      <h6 className="fw-bold mb-3">{title}</h6>
      <ResponsiveContainer width="100%" height={320}>
        {children}
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

export default StatisticsPage;
