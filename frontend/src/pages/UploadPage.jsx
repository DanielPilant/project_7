import { useEffect, useState } from 'react';
import {
  fetchProducts,
  uploadSoundPack,
  uploadPreviewSound,
} from '../api/products.js';

// Upload page: two forms.
// 1. Upload a sound pack (zip + main demo + cover) -> creates a Product row + S3 files.
// 2. Upload an extra preview demo, choosing which pack it belongs to by name
//    (the dropdown value is the product id, so the demo is stored with that id).
export default function UploadPage() {
  const [packs, setPacks] = useState([]);

  // --- Sound pack form state ---
  const [packForm, setPackForm] = useState({ title: '', description: '', price: '' });
  const [zipFile, setZipFile] = useState(null);
  const [mainDemo, setMainDemo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [packStatus, setPackStatus] = useState('idle'); // idle | uploading | success | error
  const [packResult, setPackResult] = useState(null);
  const [packError, setPackError] = useState('');

  // --- Preview demo form state ---
  const [selectedPackId, setSelectedPackId] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewSound, setPreviewSound] = useState(null);
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewResult, setPreviewResult] = useState(null);
  const [previewError, setPreviewError] = useState('');

  // Load existing packs so the dropdown can offer them by name.
  function refreshPacks() {
    fetchProducts()
      .then(setPacks)
      .catch(() => setPacks([]));
  }

  useEffect(() => {
    refreshPacks();
  }, []);

  async function handlePackSubmit(e) {
    e.preventDefault();
    setPackStatus('uploading');
    setPackError('');

    const formData = new FormData();
    formData.append('creatorId', 1); // TODO: real creator id once auth exists
    formData.append('title', packForm.title);
    formData.append('description', packForm.description);
    formData.append('price', packForm.price);
    formData.append('zipFile', zipFile);
    formData.append('mainDemo', mainDemo);
    formData.append('coverImage', coverImage);

    try {
      const data = await uploadSoundPack(formData);
      setPackResult(data);
      setPackStatus('success');
      refreshPacks(); // new pack shows up in the demo dropdown right away
      setSelectedPackId(String(data.productId)); // preselect the pack we just uploaded
    } catch (err) {
      setPackError(err.response?.data?.error || err.message);
      setPackStatus('error');
    }
  }

  async function handlePreviewSubmit(e) {
    e.preventDefault();
    setPreviewStatus('uploading');
    setPreviewError('');

    const formData = new FormData();
    formData.append('productId', selectedPackId);
    formData.append('title', previewTitle);
    formData.append('sound', previewSound);

    try {
      const data = await uploadPreviewSound(formData);
      setPreviewResult(data);
      setPreviewStatus('success');
    } catch (err) {
      setPreviewError(err.response?.data?.error || err.message);
      setPreviewStatus('error');
    }
  }

  return (
    <section>
      <h1>Upload to AWS</h1>

      {/* ---------- 1. Sound pack (ZIP) ---------- */}
      <form className="upload-card" onSubmit={handlePackSubmit}>
        <h2>1. Upload Sound Pack (ZIP)</h2>

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
            onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
            placeholder="What's inside the pack?"
          />
        </label>

        <label className="field">
          ZIP file
          <input required type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files[0])} />
        </label>

        <label className="field">
          Main demo (mp3/wav)
          <input required type="file" accept=".mp3,.wav" onChange={(e) => setMainDemo(e.target.files[0])} />
        </label>

        <label className="field">
          Cover image (jpg/png)
          <input required type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setCoverImage(e.target.files[0])} />
        </label>

        <button type="submit" disabled={packStatus === 'uploading'}>
          {packStatus === 'uploading' ? 'Uploading…' : 'Upload pack'}
        </button>

        {packStatus === 'error' && <p className="msg--error">{packError}</p>}
        {packStatus === 'success' && packResult && (
          <div className="upload-result">
            <p>✅ Pack created — product id <strong>{packResult.productId}</strong></p>
            <ul>
              <li>ZIP: <a href={packResult.files.zipFileUrl} target="_blank" rel="noreferrer">{packResult.files.zipFileUrl}</a></li>
              <li>Demo: <a href={packResult.files.mainDemoUrl} target="_blank" rel="noreferrer">{packResult.files.mainDemoUrl}</a></li>
              <li>Cover: <a href={packResult.files.coverImageUrl} target="_blank" rel="noreferrer">{packResult.files.coverImageUrl}</a></li>
            </ul>
            <audio controls src={packResult.files.mainDemoUrl} />
          </div>
        )}
      </form>

      {/* ---------- 2. Preview demo for an existing pack ---------- */}
      <form className="upload-card" onSubmit={handlePreviewSubmit}>
        <h2>2. Upload Preview Demo for a Pack</h2>

        <label className="field">
          Pack (the zip you uploaded)
          <select
            required
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
          >
            <option value="" disabled>
              {packs.length ? 'Choose a pack…' : 'No packs yet — upload one above'}
            </option>
            {packs.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title} (id {pack.id})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Demo title
          <input
            required
            type="text"
            value={previewTitle}
            onChange={(e) => setPreviewTitle(e.target.value)}
            placeholder="e.g. Acapella preview"
          />
        </label>

        <label className="field">
          Sound file (mp3/wav)
          <input required type="file" accept=".mp3,.wav" onChange={(e) => setPreviewSound(e.target.files[0])} />
        </label>

        <button type="submit" disabled={previewStatus === 'uploading'}>
          {previewStatus === 'uploading' ? 'Uploading…' : 'Upload demo'}
        </button>

        {previewStatus === 'error' && <p className="msg--error">{previewError}</p>}
        {previewStatus === 'success' && previewResult && (
          <div className="upload-result">
            <p>
              ✅ Demo “{previewResult.preview.title}” saved for product id{' '}
              <strong>{selectedPackId}</strong>
            </p>
            <p>
              <a href={previewResult.preview.url} target="_blank" rel="noreferrer">
                {previewResult.preview.url}
              </a>
            </p>
            <audio controls src={previewResult.preview.url} />
          </div>
        )}
      </form>
    </section>
  );
}
