import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";

const RequireAuth = () => {
  const { user, checked } = useAuth();
  const location = useLocation();

  if (!checked) return null;

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;