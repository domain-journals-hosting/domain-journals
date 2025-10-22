import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";

const RequireAuth = () => {
  const { user, checked, error } = useAuth();
  const location = useLocation();
  console.log(user?.name, checked, error);
  return !checked ? (
    <p className="loading"> Loading...</p>
  ) : user?.name ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
