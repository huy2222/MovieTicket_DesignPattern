import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // chưa có token → đá về login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // có token → cho phép truy cập
  return children;
}