import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import Modal from "./Modal.jsx";
import {
  likeProduct,
  unlikeProduct,
  fetchComments,
  addComment,
  deleteComment,
} from "../api/interactions.js";
import styles from "./PackInteractions.module.css";

// Reusable like button + comment popup. Used on catalog cards and details.
export default function PackInteractions({ product }) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(Number(product.like_count) || 0);
  const [liked, setLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Number(product.comment_count) || 0,
  );
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  async function toggleLike() {
    if (!user) return;
    const info = liked
      ? await unlikeProduct(product.id, user.id)
      : await likeProduct(product.id, user.id);
    setLiked(info.liked);
    setLikeCount(info.count);
  }

  async function openComments() {
    const list = await fetchComments(product.id);
    setComments(list);
    setCommentCount(list.length);
    setOpen(true);
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const list = await addComment(product.id, user.id, text.trim());
    setComments(list);
    setCommentCount(list.length);
    setText("");
  }

  async function removeComment(id) {
    await deleteComment(id, user.id, user.role);
    const list = await fetchComments(product.id);
    setComments(list);
    setCommentCount(list.length);
  }

  const canDelete = (c) =>
    user && (user.role === "admin" || String(user.id) === String(c.user_id));

  return (
    <div className={styles.bar}>
      <button
        className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
        onClick={toggleLike}
        disabled={!user}
        title={user ? "Like" : "Log in to like"}
      >
        ❤ {likeCount}
      </button>

      <button className={styles.commentBtn} onClick={openComments}>
        💬 {commentCount}
      </button>

      {open && (
        <Modal
          title={`Comments — ${product.title}`}
          onClose={() => setOpen(false)}
        >
          {comments.length === 0 && (
            <p className={styles.empty}>No comments yet.</p>
          )}

          <ul className={styles.list}>
            {comments.map((c) => (
              <li key={c.id} className={styles.item}>
                <div className={styles.meta}>
                  <span className={styles.user}>@{c.username}</span>
                  {canDelete(c) && (
                    <button
                      className={styles.delete}
                      onClick={() => removeComment(c.id)}
                    >
                      delete
                    </button>
                  )}
                </div>
                {c.comment}
              </li>
            ))}
          </ul>

          {user ? (
            <form className={styles.form} onSubmit={submitComment}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
              />
              <button type="submit" className="btn">
                Post
              </button>
            </form>
          ) : (
            <p className={styles.empty}>Log in to comment.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
