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
// formData fields: productId, title, sound
export function uploadPreviewSound(formData) {
  return api
    .post('/products/sound-preview', formData)
    .then((res) => res.data);
}
