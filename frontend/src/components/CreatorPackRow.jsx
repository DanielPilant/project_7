import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  updateProduct,
  deleteProduct,
  fetchPreviews,
  deletePreview,
  uploadPreviewSound,
} from "../api/products.js";

// One pack in the creator dashboard: edit text fields, delete the pack, and
// manage (list / add / delete) its preview demos. `onChanged` refreshes the
// parent list after a create/edit/delete that changes it.
export default function CreatorPackRow({ pack, onChanged }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: pack.title,
    description: pack.description || "",
    price: pack.price,
  });
  const [showPreviews, setShowPreviews] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveEdit(e) {
    e.preventDefault();
    setError("");
    try {
      await updateProduct(pack.id, {
        title: form.title,
        description: form.description,
        price: form.price,
        requesterId: user.id,
        requesterRole: user.role,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${pack.title}"? This removes its files, previews, likes and comments.`,
      )
    )
      return;
    setBusy(true);
    try {
      await deleteProduct(pack.id, user.id, user.role);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setBusy(false);
    }
  }

  async function togglePreviews() {
    if (!showPreviews) setPreviews(await fetchPreviews(pack.id));
    setShowPreviews(!showPreviews);
  }

  async function addPreview(e) {
    e.preventDefault();
    setError("");
    if (!previewFile || !previewTitle.trim()) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("productId", pack.id);
      fd.append("title", previewTitle.trim());
      fd.append("sound", previewFile);
      fd.append("requesterId", user.id);
      fd.append("requesterRole", user.role);
      await uploadPreviewSound(fd);
      setPreviewTitle("");
      setPreviewFile(null);
      e.target.reset();
      setPreviews(await fetchPreviews(pack.id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removePreview(id) {
    await deletePreview(id, user.id, user.role);
    setPreviews(await fetchPreviews(pack.id));
  }

  return (
    <div className="pack-row">
      {!editing ? (
        <div className="pack-row__head">
          <div>
            <strong>{pack.title}</strong> — ${Number(pack.price).toFixed(2)}
            <span className="pack-row__stats">
              ❤ {pack.like_count} · 💬 {pack.comment_count}
            </span>
          </div>
          <div className="pack-row__actions">
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={togglePreviews}>
              {showPreviews ? "Hide" : "Previews"}
            </button>
            <button className="danger" onClick={handleDelete} disabled={busy}>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <form className="pack-row__edit" onSubmit={saveEdit}>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows="2"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <div className="pack-row__actions">
            <button type="submit" className="btn">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {showPreviews && (
        <div className="pack-row__previews">
          <h4>Previews</h4>
          {previews.length === 0 && <p>No previews yet.</p>}
          <ul className="preview-list">
            {previews.map((p) => (
              <li key={p.id} className="preview-item">
                <span>{p.title}</span>
                <audio controls src={p.demo_audio_url} />
                <button className="danger" onClick={() => removePreview(p.id)}>
                  delete
                </button>
              </li>
            ))}
          </ul>
          <form className="preview-add" onSubmit={addPreview}>
            <input
              value={previewTitle}
              onChange={(e) => setPreviewTitle(e.target.value)}
              placeholder="Preview title"
              required
            />
            <input
              type="file"
              accept=".mp3,.wav"
              onChange={(e) => setPreviewFile(e.target.files[0])}
              required
            />
            <button type="submit" className="btn" disabled={busy}>
              Add preview
            </button>
          </form>
        </div>
      )}

      {error && <p className="msg--error">{error}</p>}
    </div>
  );
}
