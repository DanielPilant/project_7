import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { fetchUsers, setUserRole, deleteUser } from "../auth/auth.js";
import { fetchProducts } from "../api/products.js";
import { fetchAllComments, deleteComment } from "../api/interactions.js";
import CreatorPackRow from "../components/CreatorPackRow.jsx";
import styles from "./AdminPage.module.css";

// Admin content panel: list + manage all users, packs and comments.
export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [packs, setPacks] = useState([]);
  const [comments, setComments] = useState([]);

  const loadUsers = async () => setUsers(await fetchUsers());
  const loadPacks = async () => setPacks(await fetchProducts());
  const loadComments = async () => setComments(await fetchAllComments());

  useEffect(() => {
    if (tab === "users") loadUsers();
    else if (tab === "packs") loadPacks();
    else if (tab === "comments") loadComments();
  }, [tab]);

  async function changeRole(id, role) {
    await setUserRole(id, role);
    loadUsers();
  }

  async function removeUser(id) {
    if (!window.confirm("Delete this user? Their likes and comments go too."))
      return;
    await deleteUser(id);
    loadUsers();
  }

  async function removeComment(id) {
    await deleteComment(id, user.id, user.role);
    loadComments();
  }

  const tabClass = (t) =>
    `${styles.tab} ${tab === t ? styles.active : ""}`;

  return (
    <section>
      <h1>Admin Panel</h1>

      <div className={styles.tabs}>
        <button className={tabClass("users")} onClick={() => setTab("users")}>
          Users
        </button>
        <button className={tabClass("packs")} onClick={() => setTab("packs")}>
          Packs
        </button>
        <button
          className={tabClass("comments")}
          onClick={() => setTab("comments")}
        >
          Comments
        </button>
      </div>

      {/* ---- Users ---- */}
      {tab === "users" && (
        <ul className={styles.list}>
          {users.map((u) => (
            <li key={u.id} className={styles.row}>
              <span>
                {u.name} (@{u.username}) — {u.email}{" "}
                <span className="badge">{u.role}</span>
              </span>
              <span className={styles.actions}>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  disabled={u.id === user.id}
                >
                  <option value="customer">customer</option>
                  <option value="creator">creator</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  className={styles.del}
                  onClick={() => removeUser(u.id)}
                  disabled={u.id === user.id}
                >
                  delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ---- Packs (reuse the creator row; admin controls any pack) ---- */}
      {tab === "packs" && (
        <>
          {packs.length === 0 && <p>No packs.</p>}
          {packs.map((p) => (
            <CreatorPackRow key={p.id} pack={p} onChanged={loadPacks} />
          ))}
        </>
      )}

      {/* ---- Comments ---- */}
      {tab === "comments" && (
        <ul className={styles.list}>
          {comments.length === 0 && <p>No comments.</p>}
          {comments.map((c) => (
            <li key={c.id} className={styles.comment}>
              <div className={styles.commentMeta}>
                <span>
                  @{c.username} on{" "}
                  <Link to={`/products/${c.product_id}`} className={styles.link}>
                    {c.product_title}
                  </Link>
                </span>
                <button
                  className={styles.del}
                  onClick={() => removeComment(c.id)}
                >
                  delete
                </button>
              </div>
              {c.comment}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
