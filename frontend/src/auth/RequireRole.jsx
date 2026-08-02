import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

// Route guard: must be logged in, and (optionally) have one of the allowed
// roles. `role` may be a single role string or an array of allowed roles.
export default function RequireRole({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const allowed = role ? (Array.isArray(role) ? role : [role]) : null;
  if (allowed && !allowed.includes(user.role)) {
    return <p className="msg--error">Access denied.</p>;
  }
  return children;
}
