import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (String(user.role).toUpperCase() !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}