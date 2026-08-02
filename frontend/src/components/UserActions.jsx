import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { fetchUserActivity, deleteComment } from "../api/interactions.js";
import styles from "./UserActions.module.css";

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
      <button className="btn btn--ghost" onClick={toggle}>
        {open ? "Hide Actions" : "⚡ Actions"}
      </button>

      {open && (
        <div className={styles.card}>
          <h2>My Likes ({activity.likes.length})</h2>
          {activity.likes.length === 0 && <p>You haven&apos;t liked any packs.</p>}
          <ul className={styles.list}>
            {activity.likes.map((l) => (
              <li key={l.id} className={styles.row}>
                <Link to={`/products/${l.id}`} className={styles.link}>
                  {l.title}
                </Link>
                <span className={styles.meta}>
                  by {l.creator_name || "Unknown"}
                </span>
              </li>
            ))}
          </ul>

          <h2>My Comments ({activity.comments.length})</h2>
          {activity.comments.length === 0 && <p>You haven&apos;t commented yet.</p>}
          <ul className={styles.list}>
            {activity.comments.map((c) => (
              <li key={c.id} className={styles.comment}>
                <div className={styles.commentMeta}>
                  <Link to={`/products/${c.product_id}`} className={styles.link}>
                    {c.product_title}
                  </Link>
                  <button
                    className={styles.delete}
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
