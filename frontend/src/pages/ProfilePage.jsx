import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { fetchUsers, makeAdmin } from "../auth/auth.js";

export default function ProfilePage() {
  const { user, becomeCreator } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // Admins load the full user list (from the DB) to manage roles.
  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
        .then(setUsers)
        .catch(() => setUsers([]));
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  async function handleMakeAdmin(id) {
    await makeAdmin(id);
    setUsers(await fetchUsers());
  }

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

      {/* Creator + admin: access to the upload/creator page */}
      {(user.role === "creator" || user.role === "admin") && (
        <Link to="/upload" className="btn">
          Creator Page
        </Link>
      )}

      {/* Admin-only: promote other users to admin */}
      {user.role === "admin" && (
        <div className="upload-card">
          <h2>Manage Users</h2>
          <ul className="user-list">
            {users.map((u) => (
              <li key={u.id} className="user-row">
                <span>
                  {u.name} (@{u.username}){" "}
                  <span className="badge">{u.role}</span>
                </span>
                {u.role !== "admin" && (
                  <button onClick={() => handleMakeAdmin(u.id)}>
                    Make admin
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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
