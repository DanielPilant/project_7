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
