import api from './axios.js';

// Product Catalog API calls. These map to the backend REST endpoints
// (GET /api/products, GET /api/products/:id) your team will build.

// List products, optionally filtered by a search term.
export function fetchProducts(search = '') {
  return api
    .get('/products', { params: search ? { search } : {} })
    .then((res) => res.data);
}

// Fetch a single product's full details.
export function fetchProductById(id) {
  return api.get(`/products/${id}`).then((res) => res.data);
}

// Upload a new sound pack (zip + main demo + cover image) as multipart form data.
// formData fields: creatorId, title, description, price, zipFile, mainDemo, coverImage
export function uploadSoundPack(formData) {
  return api
    .post('/products/sound-pack', formData)
    .then((res) => res.data);
}

// Upload a preview demo sound and attach it to an existing product by id.
// formData fields: productId, title, sound, requesterId, requesterRole
export function uploadPreviewSound(formData) {
  return api
    .post('/products/sound-preview', formData)
    .then((res) => res.data);
}

// A single creator's own packs (with like_count / comment_count).
export function fetchProductsByCreator(creatorId) {
  return api.get(`/products/creator/${creatorId}`).then((res) => res.data);
}

// Update a pack's text fields (owner creator or admin).
export function updateProduct(id, payload) {
  return api.patch(`/products/${id}`, payload).then((res) => res.data);
}

// Delete a pack (owner creator or admin).
export function deleteProduct(id) {
  return api
    .delete(`/products/${id}`)
    .then((res) => res.data);
}

// Preview demos attached to a pack.
export function fetchPreviews(productId) {
  return api.get(`/products/${productId}/previews`).then((res) => res.data);
}

export function deletePreview(previewId) {
  return api
    .delete(`/products/previews/${previewId}`)
    .then((res) => res.data);
}
