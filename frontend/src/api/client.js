import axios from 'axios';

// Support VITE_API_BASE_URL in production (Vercel -> Render)
// Fall back to '/api' in local development (proxied by Vite to localhost:5000)
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = rawBaseURL.endsWith('/api')
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
});

// Auto-attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('loan_saathi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401 (expired/invalid token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('loan_saathi_token');
      localStorage.removeItem('loan_saathi_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
