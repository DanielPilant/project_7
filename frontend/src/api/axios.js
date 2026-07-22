import axios from 'axios';

// Single axios instance used by every API module.
// baseURL comes from .env (VITE_API_URL); falls back to the Vite dev proxy.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export default api;
