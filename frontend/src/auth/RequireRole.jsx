import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

// Route guard: must be logged in, and (optionally) have a specific role.
export default function RequireRole({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <p className="msg--error">Access denied — {role}s only.</p>;
  }
  return children;
}
