import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { uploadSoundPack, fetchProductsByCreator } from "../api/products.js";
import CreatorPackRow from "../components/CreatorPackRow.jsx";

// Creator Dashboard: create a pack, then view/edit/delete your own packs and
// manage each pack's preview demos.
export default function UploadPage() {
  const { user } = useAuth();
  const [packs, setPacks] = useState([]);

  const [packForm, setPackForm] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [zipFile, setZipFile] = useState(null);
  const [mainDemo, setMainDemo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [error, setError] = useState("");

  async function loadPacks() {
    if (!user) return;
    try {
      setPacks(await fetchProductsByCreator(user.id));
    } catch {
      setPacks([]);
    }
  }

  useEffect(() => {
    loadPacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    setStatus("uploading");
    setError("");

    const fd = new FormData();
    fd.append("creatorId", user.id);
    fd.append("creatorName", user.name);
    fd.append("title", packForm.title);
    fd.append("description", packForm.description);
    fd.append("price", packForm.price);
    fd.append("zipFile", zipFile);
    fd.append("mainDemo", mainDemo);
    fd.append("coverImage", coverImage);

    try {
      await uploadSoundPack(fd);
      setStatus("success");
      setPackForm({ title: "", description: "", price: "" });
      setZipFile(null);
      setMainDemo(null);
      setCoverImage(null);
      e.target.reset();
      loadPacks();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus("error");
    }
  }

  return (
    <section>
      <h1>Creator Dashboard</h1>

      {/* ---- Create ---- */}
      <form className="upload-card" onSubmit={handleCreate}>
        <h2>Create a new pack</h2>

        <label className="field">
          Pack name
          <input
            required
            type="text"
            value={packForm.title}
            onChange={(e) => setPackForm({ ...packForm, title: e.target.value })}
            placeholder="e.g. Infinity Pack"
          />
        </label>

        <label className="field">
          Price ($)
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={packForm.price}
            onChange={(e) => setPackForm({ ...packForm, price: e.target.value })}
            placeholder="19.99"
          />
        </label>

        <label className="field">
          Description
          <textarea
            rows="2"
            value={packForm.description}
            onChange={(e) =>
              setPackForm({ ...packForm, description: e.target.value })
            }
            placeholder="What's inside the pack?"
          />
        </label>

        <label className="field">
          ZIP file
          <input
            required
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files[0])}
          />
        </label>

        <label className="field">
          Main demo (mp3/wav)
          <input
            required
            type="file"
            accept=".mp3,.wav"
            onChange={(e) => setMainDemo(e.target.files[0])}
          />
        </label>

        <label className="field">
          Cover image (jpg/png)
          <input
            required
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setCoverImage(e.target.files[0])}
          />
        </label>

        <button type="submit" disabled={status === "uploading"}>
          {status === "uploading" ? "Uploading…" : "Create pack"}
        </button>

        {status === "error" && <p className="msg--error">{error}</p>}
        {status === "success" && (
          <p className="msg--success">Pack created!</p>
        )}
      </form>

      {/* ---- Read / Update / Delete ---- */}
      <h2>My Packs ({packs.length})</h2>
      {packs.length === 0 && <p>You haven't uploaded any packs yet.</p>}
      {packs.map((pack) => (
        <CreatorPackRow key={pack.id} pack={pack} onChanged={loadPacks} />
      ))}
    </section>
  );
}
