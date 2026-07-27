import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { getUsers, makeAdmin } from "../auth/auth.js";

export default function ProfilePage() {
  const { user } = useAuth();
  // Local copy of the user list so the admin panel refreshes after promoting.
  const [users, setUsers] = useState(() => getUsers());

  if (!user) return <Navigate to="/login" replace />;

  function handleMakeAdmin(id) {
    makeAdmin(id);
    setUsers(getUsers());
  }

  return (
    <section>
      <h1>Settings</h1>
      <p>
        {user.name} — {user.email} <span className="badge">{user.role}</span>
      </p>

      {/* Creator-only: access to the upload/creator page */}
      {user.role === "creator" && (
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
                  {u.name} — {u.email} <span className="badge">{u.role}</span>
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

      {/* Plain user: nothing extra for now */}
      {user.role === "user" && (
        <p>Browse the catalog to buy sound packs. (Catalog coming next.)</p>
      )}
    </section>
  );
}
