import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const RequireUserAuth = ({ allowedRoles = ["admin", "editor"], children }) => {
  const { user, checked } = useUser();
  const location = useLocation();

  if (!checked) return <p className="loading">Loading...</p>;

  if (!user?.name) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return children ? (
      ""
    ) : (
      <Navigate to="/unauthorized" state={{ from: location }} replace />
    );
  }

  return children ? children : <Outlet />;
};

export default RequireUserAuth;
