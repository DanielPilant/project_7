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

// Reusable like button + comment popup for a pack. Used on catalog cards and
// on the details page. The `liked` highlight reflects actions taken this
// session (the list endpoint doesn't say whether you already liked).
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
    <div className="interactions">
      <button
        className={`like-btn ${liked ? "is-liked" : ""}`}
        onClick={toggleLike}
        disabled={!user}
        title={user ? "Like" : "Log in to like"}
      >
        ❤ {likeCount}
      </button>

      <button className="comment-btn" onClick={openComments}>
        💬 {commentCount}
      </button>

      {open && (
        <Modal
          title={`Comments — ${product.title}`}
          onClose={() => setOpen(false)}
        >
          {comments.length === 0 && <p>No comments yet.</p>}

          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <div className="comment-item__meta">
                  <span>@{c.username}</span>
                  {canDelete(c) && (
                    <button
                      className="comment-item__delete"
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
            <form className="comment-form" onSubmit={submitComment}>
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
            <p>Log in to comment.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
