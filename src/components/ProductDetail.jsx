import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/products/productdetail/${id}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Lỗi khi lấy dữ liệu");
        } else {
          setProduct(data);
        }
      } catch (err) {
        setError("Không thể kết nối server!");
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );

  if (!product) return <p className="m-4">Không có dữ liệu sản phẩm</p>;

  return (
    <div className="p-4">

      {/* TITLE */}
      <h3 className="mb-4 fw-bold text-primary">
        <i className="bi bi-box-seam"></i> Chi tiết sản phẩm
      </h3>

      <Row>
        {/* IMAGE */} 
        <Col md={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Header className="fw-bold bg-gradient text-white"
              style={{ background: "linear-gradient(135deg, #4e73df, #1cc88a)" }}>
              Ảnh sản phẩm
            </Card.Header>

            <Card.Body className="text-center p-4">
              <img
                src={`http://localhost:5000/uploads/products/${product.image}`}
                alt={product.name}
                className="img-fluid rounded shadow"
                style={{
                  maxHeight: 300,
                  borderRadius: 12,
                  transition: "0.3s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* INFO */}
        <Col md={8}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Header
              className="fw-bold text-white"
              style={{
                background: "linear-gradient(135deg, #36b9cc, #0ea5e9)",
              }}
            >
              Thông tin sản phẩm
            </Card.Header>

            <Card.Body style={{ fontSize: 16 }}>
              <h4 className="fw-bold text-dark">{product.name}</h4>
              <p className="text-muted">{product.slug}</p>

              <p>
                <strong className="text-dark">Giá bán:</strong>{" "}
                <span className="text-danger fw-bold" style={{ fontSize: 22 }}>
                  {Number(product.price).toLocaleString()}₫
                </span>
              </p>

              <p>
                <strong className="text-dark">Trạng thái:</strong>{" "}
                {product.status === "active" ? (
                  <Badge bg="success" className="px-3 py-2">
                    Còn hàng
                  </Badge>
                ) : (
                  <Badge bg="secondary" className="px-3 py-2">
                    Hết hàng
                  </Badge>
                )}
              </p>

              <p className="mt-3">
                <strong className="text-dark">Mô tả:</strong>
                <br />
                {product.description}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* VARIANTS */}
      <Card className="shadow-lg border-0 rounded-4 mt-4">
        <Card.Header
          className="fw-bold text-white"
          style={{
            background: "linear-gradient(135deg, #f6c23e, #f97316)",
          }}
        >
          Danh sách biến thể (Variants)
        </Card.Header>

        <Card.Body>
          {product.variants && product.variants.length > 0 ? (
            <div
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                border: "1px solid #e9ecef",
                borderRadius: 8,
              }}
            >
              <Table hover bordered responsive className="mb-0">
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên biến thể</th>
                    <th>Màu</th>
                    <th>Công suất</th>
                    <th>Kết nối</th>
                    <th>Micro</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>

                <tbody>
                  {product.variants.map((v) => (
                    <tr
                      key={v.id}
                      style={{ cursor: "pointer" }}
                      className="variant-row"
                    >
                      <td>
                        <img
                          src={`http://localhost:5000/uploads/products/${v.image}`}
                          alt={v.name_variant}
                          className="img-fluid rounded"
                          style={{
                            maxHeight: 70,
                            borderRadius: 8,
                          }}
                        />
                      </td>

                      <td className="fw-bold">{v.name_variant}</td>
                      <td>{v.color}</td>
                      <td>{v.power}</td>
                      <td>{v.connection_type}</td>

                      <td>
                        {v.has_microphone === 1 ? (
                          <Badge bg="success">✔ Có</Badge>
                        ) : (
                          <Badge bg="secondary">✖ Không</Badge>
                        )}
                      </td>

                      <td className="fw-bold text-danger">
                        {Number(v.price).toLocaleString()}₫
                      </td>

                      <td className="fw-bold">{v.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted">Sản phẩm không có biến thể nào</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductDetail;
