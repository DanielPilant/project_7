import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import UserActions from "../components/UserActions.jsx";

export default function ProfilePage() {
  const { user, becomeCreator } = useAuth();
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" replace />;

  async function handleBecomeCreator() {
    setError("");
    try {
      await becomeCreator();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <section>
      <h1>Settings</h1>
      <p>
        {user.name} (@{user.username}) — {user.email}{" "}
        <span className="badge">{user.role}</span>
      </p>

      {/* Everyone: my likes + my comments */}
      <UserActions />

      <div className="profile-links">
        {(user.role === "creator" || user.role === "admin") && (
          <Link to="/upload" className="btn">
            Creator Page
          </Link>
        )}
        {user.role === "admin" && (
          <Link to="/admin" className="btn">
            Admin Panel
          </Link>
        )}
      </div>

      {/* Plain customer: can upgrade themselves to a creator */}
      {user.role === "customer" && (
        <>
          <p>Browse the catalog to buy sound packs. (Buying coming next.)</p>
          <button className="btn" onClick={handleBecomeCreator}>
            Become a creator
          </button>
          {error && <p className="msg--error">{error}</p>}
        </>
      )}
    </section>
  );
}
