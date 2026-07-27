import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");
//    without replace navigation normally adds a new history entry
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;