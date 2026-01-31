// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { Table, Badge, Image, Button, Collapse, Pagination, Modal, Form, Row, Col, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getProducts, deleteProduct, createProduct, updateProduct, updateVariants, deleteVariant, editVariant } from "../api/productApi";
import { getBrands } from "../api/brandApi";
import { getCategories } from "../api/categoryApi";
import { getCoupons } from "../api/couponApi";
import { MdAutoFixOff,MdAddBox ,MdDelete  ,MdRemoveRedEye} from "react-icons/md";
import ProductDetail from "../components/ProductDetail";
import { useNavigate } from "react-router-dom";
const Products = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL; 

  const limit = 10;
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [openVariants, setOpenVariants] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal Thêm biến thể
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [variants, setVariants] = useState([]);


  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
const [editingVariant, setEditingVariant] = useState(null);


const [searchKeyword, setSearchKeyword] = useState("");
const [filterCategory, setFilterCategory] = useState("");
const [filterBrand, setFilterBrand] = useState("");
const [filterStatus, setFilterStatus] = useState("");

const applyFilter = () => {
  fetchProducts(1); // lọc từ trang 1
};

// Mở modal khi bấm Sửa
const handleOpenEditVariant = (variant) => {
  setEditingVariant({...variant}); // clone để chỉnh sửa
  setShowEditVariantModal(true);
};

// Gọi API lưu
const handleUpdateVariant = async () => {
  try {
    setLoading(true);
    await editVariant(editingVariant.id, editingVariant);
    setShowEditVariantModal(false);
    fetchProducts(currentPage);
  } catch (error) {
    console.error(error);
    alert("❌ Lỗi cập nhật biến thể");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts(currentPage);
    fetchOptions();
  }, [currentPage]);

const fetchProducts = async (page) => {
  setLoading(true);
  try {
    const filters = {
      search: searchKeyword,
      category_id: filterCategory,
      brand_id: filterBrand,
      status: filterStatus
    };
    const data = await getProducts(page, limit, filters);
    setProducts(data.data);
    setCurrentPage(data.currentPage);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
  } finally {
    setLoading(false);
  }
};

  const fetchOptions = async () => {
    try {
      const b = await getBrands();
      const c = await getCategories();
      const coupon = await getCoupons();
      setBrands(b);
      setCategories(c);
      setCoupons(coupon);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleVariants = (productId) => {
    setOpenVariants(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const renderStatus = (status) => {
    const color = status === "active" ? "success" : status === "inactive" ? "secondary" : "warning";
    return <Badge bg={color}>{status}</Badge>;
  };

  // ----------------- SẢN PHẨM -----------------
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        fetchProducts(currentPage);
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append("name", form.name.value);
    formData.append("slug", form.slug.value);
    formData.append("description", form.description.value);
    formData.append("price", form.price.value);
    formData.append("status", form.status.value);
    formData.append("brand_id", form.brand_id.value || "");
    formData.append("coupon_id", form.coupon_id.value || "");
    formData.append("category_id", form.category_id.value || "");

    if (form.image.files[0]) formData.append("image", form.image.files[0]);

    setLoading(true);
    try {
      if (editingProduct) await updateProduct(editingProduct.id, formData);
      else await createProduct(formData);
      setShowModal(false);
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- BIẾN THỂ -----------------
  const handleManageVariants = (product) => {
    setEditingProduct(product);
    setVariants([]); // chỉ thêm mới
    setShowVariantsModal(true);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, {
      name_variant: "",
      color: "",
      size: "",
      power: "",
      connection_type: "",
      has_microphone: "0",
      price: 0,
      stock: 0,
      image: null
    }]);
  };

  const removeVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const saveVariants = async () => {
    if (!variants.length) return;
    setLoading(true);
    try {
      await updateVariants(editingProduct.id, variants); // API thêm nhiều biến thể mới
      setShowVariantsModal(false);
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Lỗi lưu biến thể:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sửa/xóa trực tiếp biến thể
  const handleEditVariant = async (productId, variant) => {
    const updatedData = await editVariant(variant.id, variant); // API sửa 1 biến thể
    fetchProducts(currentPage);
  };

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm("Bạn có chắc muốn xóa biến thể này?")) {
      await deleteVariant(variantId);
      fetchProducts(currentPage);
    }
  };

  // ----------------- PHÂN TRANG -----------------
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
        {i}
      </Pagination.Item>
    );
  }

  // ----------------- RENDER -----------------
  return (
    <div>
      <h3 className="mb-4">Danh sách sản phẩm</h3>
      <Button className="mb-3" onClick={handleAdd}>Thêm sản phẩm</Button>
<Row className="mb-3">
  <Col md={3}>
    <Form.Control
      placeholder="Tìm kiếm theo tên"
      value={searchKeyword}
      onChange={(e) => setSearchKeyword(e.target.value)}
    />
  </Col>
  <Col md={2}>
    <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
      <option value="">Tất cả danh mục</option>
      {categories?.data?.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </Form.Select>
  </Col>
  <Col md={2}>
    <Form.Select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
      <option value="">Tất cả thương hiệu</option>
      {brands?.data?.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </Form.Select>
  </Col>
  <Col md={2}>
    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
      <option value="">Tất cả trạng thái</option>
      <option value="active">Hoạt động</option>
      <option value="inactive">Không hoạt động</option>
    </Form.Select>
  </Col>
  <Col md={1}>
    <Button onClick={applyFilter}>Lọc</Button>
  </Col>
</Row>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table hover responsive bordered>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Hình ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thương hiệu</th>
              <th>Danh mục</th>
              <th>Biến thể</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <React.Fragment key={product.id}>
                <tr>
                  <td>{idx + 1 + (currentPage - 1) * limit}</td>
                  <td>{product.image ? <Image src={`${WEB_URL}/uploads/products/${product.image}`} thumbnail width={60} /> : "Chưa có ảnh"}</td>
                  <td>{product.name}</td>
                  <td>{Number(product.price).toLocaleString()}₫</td>
                  <td>{renderStatus(product.status)}</td>
                  <td>{product.brand_name || "-"}</td>
                  <td>{product.category_name || "-"}</td>
                  <td>
                    {product.variants?.length ? (
                      <Button variant="outline-primary" size="sm" onClick={() => toggleVariants(product.id)}>
                        {openVariants[product.id] ? "Ẩn" : `Xem (${product.variants.length})`}
                      </Button>
                    ) : "-"}
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Xem chi tiết</Tooltip>}
                    >
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1"
                        onClick={() => navigate(`/productDetail/${product.id}`)}
                      >
                        <MdRemoveRedEye />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Chỉnh sửa sản phẩm</Tooltip>}
                    >
                      <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleEdit(product)}>
                        <MdAutoFixOff />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Biến thể</Tooltip>}
                    >
                      <Button variant="outline-info" size="sm" className="me-1" onClick={() => handleManageVariants(product)}>
                        <MdAddBox  />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Xóa sản phẩm</Tooltip>}
                    >
                      <Button variant="outline-danger" size="sm" className="me-1" onClick={() =>handleDelete(product.id)}>
                        <MdDelete  />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>

                {product.variants?.length > 0 && (
                  <tr>
                    <td colSpan={10} className="p-0 border-0">
                      <Collapse in={openVariants[product.id]}>
                        <div>
                          <Table bordered hover size="sm" className="mb-0">
                            <thead className="table-secondary">
                              <tr>
                                <th>#</th>
                                <th>Tên</th>
                                <th>Màu</th>
                                <th>Power</th>
                                <th>Kết nối</th>
                                <th>Microphone</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Hình ảnh</th>
                                <th>Hành động</th>
                              </tr>
                            </thead>
                           <tbody>
                            {product.variants.map((v, i) => (
                                <tr key={v.id}>
                                <td>{i + 1}</td>
                                <td>{v.name_variant}</td>
                                <td>{v.color}</td>
                                <td>{v.power}</td>
                                <td>{v.connection_type}</td>
                                <td>
                                    <Form.Select value={v.has_microphone} onChange={(e) => handleEditVariant(product.id, {...v, has_microphone: e.target.value})}>
                                    <option value="1">Có</option>
                                    <option value="0">Không</option>
                                    </Form.Select>
                                </td>
                               <td>{Number(v.price).toLocaleString()}₫</td>
                                <td><Form.Control type="number" value={v.stock} onChange={(e) => handleEditVariant(product.id, {...v, stock: e.target.value})} /></td>
                                <td>{v.image ? <Image src={`${WEB_URL}/uploads/products/${v.image}`} thumbnail width={50} /> : "-"}</td>
                                <td className="d-flex gap-1">
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Chỉnh sửa biến thể</Tooltip>}
                                    >
                                      <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleOpenEditVariant(v)}>
                                        <MdAutoFixOff />
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Xóa biến thể</Tooltip>}
                                    >
                                      <Button variant="outline-danger" size="sm" className="me-1" onClick={() => handleDeleteVariant(v.id)}>
                                        <MdDelete />
                                      </Button>
                                    </OverlayTrigger>
                                </td>
                                </tr>
                            ))}
                            </tbody>

                          </Table>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-end">
        <Pagination>{paginationItems}</Pagination>
      </div>

      {/* Modal Thêm/Sửa sản phẩm */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control name="name" defaultValue={editingProduct?.name || ""} required
                onChange={(e) => {
                  const slugInput = document.querySelector('input[name="slug"]');
                  slugInput.value = e.target.value.toLowerCase().trim()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
                }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Slug</Form.Label>
              <Form.Control name="slug" defaultValue={editingProduct?.slug || ""} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control name="description" defaultValue={editingProduct?.description || ""} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Giá</Form.Label>
              <Form.Control name="price" type="number" defaultValue={editingProduct?.price || ""} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control name="image" type="file" accept="image/*" />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select name="status" defaultValue={editingProduct?.status || "active"}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Thương hiệu</Form.Label>
                  <Form.Select name="brand_id" defaultValue={editingProduct?.brand_id || ""}>
                    <option value="">Chọn thương hiệu</option>
                    {brands?.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Mã giảm giá</Form.Label>
                  <Form.Select name="coupon_id" defaultValue={editingProduct?.coupon_id || ""}>
                    <option value="">Chọn mã giảm giá</option>
                    {coupons?.data?.filter(c => c.quantity > 0 && c.status === "active" && new Date(c.end_date) > new Date())
                      .map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select name="category_id" defaultValue={editingProduct?.category_id || ""}>
                    <option value="">Chọn danh mục</option>
                    {categories?.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>Hủy</Button>
            <Button type="submit" variant="primary">{editingProduct ? "Cập nhật" : "Thêm"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Thêm biến thể */}
      <Modal show={showVariantsModal} onHide={() => setShowVariantsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Thêm biến thể: {editingProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center my-3"><Spinner animation="border" /></div>
          ) : (
            variants.map((v, idx) => (
              <Row key={idx} className="mb-3 align-items-end">
                <Col><Form.Label>Tên</Form.Label><Form.Control value={v.name_variant} onChange={(e) => handleVariantChange(idx, "name_variant", e.target.value)} /></Col>
                <Col><Form.Label>Màu</Form.Label><Form.Control value={v.color} onChange={(e) => handleVariantChange(idx, "color", e.target.value)} /></Col>
                <Col><Form.Label>Công suất</Form.Label><Form.Control value={v.power} onChange={(e) => handleVariantChange(idx, "power", e.target.value)} /></Col>
                <Col><Form.Label>Kết nối</Form.Label><Form.Control value={v.connection_type} onChange={(e) => handleVariantChange(idx, "connection_type", e.target.value)} /></Col>
                <Col><Form.Label>Microphone</Form.Label>
                  <Form.Select value={v.has_microphone} onChange={(e) => handleVariantChange(idx, "has_microphone", e.target.value)}>
                    <option value="1">Có</option><option value="0">Không</option>
                  </Form.Select>
                </Col>
                <Col><Form.Label>Giá</Form.Label><Form.Control type="number" value={v.price} onChange={(e) => handleVariantChange(idx, "price", e.target.value)} /></Col>
                <Col><Form.Label>Tồn kho</Form.Label><Form.Control type="number" value={v.stock} onChange={(e) => handleVariantChange(idx, "stock", e.target.value)} /></Col>
                <Col><Form.Label>Hình ảnh</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e) => handleVariantChange(idx, "image", e.target.files[0])} />
                  {v.image && !(v.image instanceof File) && <Image src={`${WEB_URL}/uploads/${v.image}`} thumbnail width={50} className="mt-1" />}
                </Col>
                <Col xs="auto">
                  <Button variant="danger" size="sm" onClick={() => removeVariant(idx)}>Xóa</Button>
                </Col>
              </Row>
            ))
          )}
          {!loading && <Button className="mt-2" onClick={addVariant}>Thêm biến thể mới</Button>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVariantsModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={saveVariants} disabled={loading}>
            {loading && <Spinner animation="border" size="sm" className="me-2" />}Lưu biến thể
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal Sửa Biến thể */}
<Modal show={showEditVariantModal} onHide={() => setShowEditVariantModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Sửa biến thể: {editingVariant?.name_variant}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {editingVariant && (
      <Form>
        <Row className="mb-2">
          <Col>
            <Form.Group>
              <Form.Label>Tên</Form.Label>
              <Form.Control
                value={editingVariant.name_variant}
                onChange={(e) => setEditingVariant({...editingVariant, name_variant: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Màu</Form.Label>
              <Form.Control
                value={editingVariant.color}
                onChange={(e) => setEditingVariant({...editingVariant, color: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Size</Form.Label>
              <Form.Control
                value={editingVariant.size || ""}
                onChange={(e) => setEditingVariant({...editingVariant, size: e.target.value})}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <Form.Group>
              <Form.Label>Power</Form.Label>
              <Form.Control
                value={editingVariant.power || ""}
                onChange={(e) => setEditingVariant({...editingVariant, power: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Kết nối</Form.Label>
              <Form.Control
                value={editingVariant.connection_type || ""}
                onChange={(e) => setEditingVariant({...editingVariant, connection_type: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Microphone</Form.Label>
              <Form.Select
                value={editingVariant.has_microphone}
                onChange={(e) => setEditingVariant({...editingVariant, has_microphone: e.target.value})}
              >
                <option value="1">Có</option>
                <option value="0">Không</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <Form.Group>
              <Form.Label>Giá</Form.Label>
              <Form.Control
                type="number"
                value={editingVariant.price}
                onChange={(e) => setEditingVariant({...editingVariant, price: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Tồn kho</Form.Label>
              <Form.Control
                type="number"
                value={editingVariant.stock}
                onChange={(e) => setEditingVariant({...editingVariant, stock: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setEditingVariant({...editingVariant, image: e.target.files[0]})}
              />
              {editingVariant.image && !(editingVariant.image instanceof File) && (
                <Image src={`${WEB_URL}/uploads/${editingVariant.image}`} thumbnail width={50} className="mt-1" />
              )}
            </Form.Group>
          </Col>
        </Row>
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditVariantModal(false)}>Hủy</Button>
    <Button variant="primary" onClick={handleUpdateVariant}>Lưu</Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default Products;
