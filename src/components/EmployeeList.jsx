import React, { useEffect, useState } from "react";
import {
  Table,
  Pagination,
  Spinner,
  Form,
  InputGroup,
  Button,
  Container,
  Modal,
  Row,
  Col,
  Image,
  Card,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  updateEmployeeStatus
} from "../api/employeeApi";
import { MdAutoFixOff,MdRemoveRedEye  ,MdDelete  } from "react-icons/md";
import toast from "react-hot-toast";

const EmployeeList = () => {
const WEB_URL ="http://localhost:5000"
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isNew, setIsNew] = useState(false); // phân biệt sửa hay thêm
  const limit = 5;

  const fetchEmployees = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const data = await getEmployees(page, limit, search);
      setEmployees(data.employees);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân viên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage, keyword);
  }, [currentPage, keyword]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setSelectedEmployee({
      full_name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      address: "",
      role: "staff",
      password: "",
      avatar: null,
    });
    setIsNew(true);
    setShowModal(true);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee({ ...employee, password: "", avatar: null });
    setIsNew(false);
    setShowModal(true);
  };


  const handleModalChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setSelectedEmployee({ ...selectedEmployee, avatar: files[0] });
    } else {
      setSelectedEmployee({ ...selectedEmployee, [name]: value });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();
      Object.keys(selectedEmployee).forEach((key) => {
        if (selectedEmployee[key] !== null && selectedEmployee[key] !== "") {
          formData.append(key, selectedEmployee[key]);
        }
      });

      if (isNew) {
        await createEmployee(formData);
        toast.success("Thêm nhân viên thành công");
      } else {
        await updateEmployee(selectedEmployee.id, formData);
        toast.success("Cập nhật nhân viên thành công");

      }

      setShowModal(false);
      fetchEmployees(currentPage, keyword);
    } catch (error) {
      console.error("Lỗi lưu nhân viên:", error);
      alert("Lỗi lưu nhân viên. Kiểm tra console.");
    }
  };
// xóa
// Thêm state cho modal xóa
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [employeeToDelete, setEmployeeToDelete] = useState(null);

// Hàm mở modal xóa
const handleDeleteClick = (employee) => {
  if (employee.role === "admin") {
    toast.error( "Không thể xóa nhân viên có vai trò Admin!");
    return;
  }
  
  setEmployeeToDelete(employee);
  setShowDeleteModal(true);
};
// Hàm xác nhận xóa
const confirmDelete = async () => {
  try {
    await deleteEmployee(employeeToDelete.id);
    toast.success("Xóa nhân viên thành công");

    setShowDeleteModal(false);
    setEmployeeToDelete(null);
    fetchEmployees(currentPage, keyword);
  } catch (error) {
    toast.error(error);
  }
};
 // 🟢 Mở modal
   const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const handleOpenStatusModal = (employee) => {
    setSelectedEmployee(employee);
    setNewStatus(employee.status === "active" ? "inactive" : "active");
    setShowStatusModal(true);
  };
const handleStatusChange = async () => {
   try {
      await updateEmployeeStatus(selectedEmployee.id, newStatus);
      toast.success("Cập nhật trạng thái thành công");

      // Cập nhật lại danh sách trong state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, status: newStatus } : emp
        )
      );

      setShowStatusModal(false);
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
};
  return (
    <Container fluid className="p-4" style={{ minHeight: "100vh", backgroundColor: "#f1f3f5" }}>
        <Row className="mb-3 align-items-center">
          <Col><h3>Danh sách nhân viên</h3></Col>
          
        </Row>
        <Row className="mb-3 ">
          <Col md="auto">
            <Button onClick={handleAddClick}>+ Thêm nhân viên</Button>
          </Col>
          <Col md={4}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={keyword}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          
        </Row>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Table striped bordered hover responsive className="text-center align-middle bg-white shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Chức vụ</th>
                <th>Phòng ban</th>
                <th>Địa chỉ</th>
                <th>Vai trò</th>
                <th>Avatar</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="10">Không có dữ liệu</td>
                </tr>
              ) : (
                employees.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1 + (currentPage - 1) * limit}</td>
                    <td>{e.full_name}</td>
                    <td>{e.email}</td>
                    <td>{e.phone}</td>
                    <td>{e.position}</td>
                    <td>{e.department}</td>
                    <td>{e.address}</td>
                    <td>{e.role == 'staff' ? 'Nhân viên' : 'Admin'}</td>
                    <td>
                      {e.avatar ? <Image src={`${WEB_URL}/uploads/products/${e.avatar}`}  width={40} /> : "-"}
                    </td>
                    <td>
                      <Form.Select
                        value={e.status}
                        onChange={() => handleOpenStatusModal(e)}
                        style={{ width: "150px" }}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </Form.Select>
                    </td>
                    <td>
                       <OverlayTrigger
                                                                                    placement="top"
                                                                                    overlay={<Tooltip>Sửa</Tooltip>} >
                                                                                    <Button variant="outline-success" size="sm" className="me-1" 
                                                                                            onClick={() => handleEditClick(e)}>
                                                                                            <MdAutoFixOff />
                                                                                    </Button>
                                                                                  </OverlayTrigger>
                       <OverlayTrigger
                                                                                    placement="top"
                                                                                    overlay={<Tooltip>Xóa</Tooltip>} >
                                                                                    <Button variant="outline-danger" size="sm" className="me-1" 
                                                                                            onClick={() =>  handleDeleteClick(e)}>
                                                                                            <MdDelete />
                                                                                    </Button>
                                                                                  </OverlayTrigger>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={currentPage === idx + 1}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>
        )}

      {/* Modal Thêm/Sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isNew ? "Thêm nhân viên" : "Sửa nhân viên"}</Modal.Title>
        </Modal.Header>
        {selectedEmployee && (
          <Modal.Body>
            <Form>
              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Họ và tên *</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={selectedEmployee.full_name}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={selectedEmployee.email}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {isNew && (
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Mật khẩu *</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={selectedEmployee.password}
                        onChange={handleModalChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Điện thoại</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={selectedEmployee.phone}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Chức vụ</Form.Label>
                    <Form.Control
                      type="text"
                      name="position"
                      value={selectedEmployee.position}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phòng ban</Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={selectedEmployee.department}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={selectedEmployee.address}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Vai trò</Form.Label>
                    <Form.Select
                      name="role"
                      value={selectedEmployee.role}
                      onChange={handleModalChange}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Avatar</Form.Label>
                    <Form.Control
                      type="file"
                      name="avatar"
                      onChange={handleModalChange}
                    />
                    {selectedEmployee.avatar && (
                      <Image
                        src={
                          typeof selectedEmployee.avatar === "string"
                            ? `/uploads/${selectedEmployee.avatar}`
                            : URL.createObjectURL(selectedEmployee.avatar)
                        }
                        roundedCircle
                        width={60}
                        height={60}
                        className="mt-2"
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Lưu</Button>
        </Modal.Footer>
      </Modal>
      {/* Modal xác nhận xóa */}
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
    <Modal.Header closeButton>
        <Modal.Title>Xác nhận xóa</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {employeeToDelete && (
        <p>Bạn có chắc muốn xóa nhân viên <strong>{employeeToDelete.full_name}</strong> không?</p>
        )}
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
        <Button variant="danger" onClick={confirmDelete}>Xóa</Button>
    </Modal.Footer>
    </Modal>
    {/* 🟢 Modal xác nhận thay đổi trạng thái */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận thay đổi trạng thái</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn chuyển nhân viên{" "}
            <strong>{selectedEmployee?.full_name}</strong> sang trạng thái{" "}
            <span className="text-primary fw-bold">
              {newStatus === "active" ? "Hoạt động" : "Không hoạt động"}
            </span>
            ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleStatusChange}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeList;
