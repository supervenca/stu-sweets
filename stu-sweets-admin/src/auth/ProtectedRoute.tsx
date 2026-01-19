import { Navigate, Outlet } from "react-router-dom";

const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now();

    if (payload.exp && now >= payload.exp * 1000) {
      localStorage.removeItem("token");
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("token");
    return false;
  }
};

const ProtectedRoute = () => {
  const allowed = isTokenValid();

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

