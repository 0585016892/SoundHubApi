import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    // Chưa login
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Không đủ quyền
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
