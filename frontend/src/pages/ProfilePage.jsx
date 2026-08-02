import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import UserActions from "../components/UserActions.jsx";
import styles from "./ProfilePage.module.css";

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
      <h1>My Profile</h1>
      <p className={styles.meta}>
        {user.name} (@{user.username}) — {user.email}{" "}
        <span className="badge">{user.role}</span>
      </p>

      {/* Everyone: my likes + my comments */}
      <UserActions />

      <div className={styles.links}>
        {(user.role === "creator" || user.role === "admin") && (
          <Link to="/upload" className="btn">
            🎛️ Creator Dashboard
          </Link>
        )}
        {user.role === "admin" && (
          <Link to="/admin" className="btn btn--ghost">
            Admin Panel
          </Link>
        )}
      </div>

      {/* Plain customer: can upgrade themselves to a creator */}
      {user.role === "customer" && (
        <>
          <p className={styles.note}>
            Want to sell your own sounds? Become a creator to upload packs.
          </p>
          <button className="btn" onClick={handleBecomeCreator}>
            Become a creator
          </button>
          {error && <p className="msg--error">{error}</p>}
        </>
      )}
    </section>
  );
}
