import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const RequireUserAuth = ({ allowedRoles }) => {
  const { user, checked, error } = useUser();
  const location = useLocation();
  console.log(user?.name, checked, error);
  return !checked ? (
    <p>Loading...</p>
  ) : user?.name && allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : user?.name ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/admin/login" state={{ from: location }} replace />
  );
};

export default RequireUserAuth;
