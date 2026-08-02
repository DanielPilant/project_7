import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { fetchUserActivity, deleteComment } from "../api/interactions.js";

// "Actions" button on the profile — reveals the current user's likes + comments.
export default function UserActions() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState({ likes: [], comments: [] });

  async function toggle() {
    if (!open) setActivity(await fetchUserActivity(user.id));
    setOpen(!open);
  }

  async function removeComment(id) {
    await deleteComment(id, user.id, user.role);
    setActivity(await fetchUserActivity(user.id));
  }

  return (
    <div>
      <button className="btn" onClick={toggle}>
        {open ? "Hide Actions" : "Actions"}
      </button>

      {open && (
        <div className="upload-card">
          <h2>My Likes ({activity.likes.length})</h2>
          {activity.likes.length === 0 && <p>You haven't liked any packs.</p>}
          <ul className="user-list">
            {activity.likes.map((l) => (
              <li key={l.id} className="user-row">
                <Link to={`/products/${l.id}`}>{l.title}</Link>
                <span className="pack-row__stats">
                  by {l.creator_name || "Unknown"}
                </span>
              </li>
            ))}
          </ul>

          <h2>My Comments ({activity.comments.length})</h2>
          {activity.comments.length === 0 && <p>You haven't commented yet.</p>}
          <ul className="comment-list">
            {activity.comments.map((c) => (
              <li key={c.id} className="comment-item">
                <div className="comment-item__meta">
                  <Link to={`/products/${c.product_id}`}>
                    {c.product_title}
                  </Link>
                  <button
                    className="comment-item__delete"
                    onClick={() => removeComment(c.id)}
                  >
                    delete
                  </button>
                </div>
                {c.comment}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
