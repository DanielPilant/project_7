import axios from 'axios';
import { getToken } from '../auth/auth.js';

// Single axios instance used by every API module.
// baseURL comes from .env (VITE_API_URL); falls back to the Vite dev proxy.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
