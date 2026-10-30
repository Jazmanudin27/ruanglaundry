import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyematkan JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ruang_laundry_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani error response (misal 401 token kedaluwarsa)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('ruang_laundry_token');
        localStorage.removeItem('ruang_laundry_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || { message: 'Terjadi kesalahan' });
    }
    return Promise.reject({ message: 'Tidak dapat terhubung ke server backend' });
  }
);

export default api;
