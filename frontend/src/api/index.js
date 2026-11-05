import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const memberApi = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  getByUid: (uid) => api.get(`/members/by-uid/${uid}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  gantiKartu: (id, uidKartuBaru) => api.put(`/members/${id}/ganti-kartu`, { uidKartuBaru }),
  perpanjang: (id, data) => api.post(`/members/${id}/perpanjang`, data),
  getHampirHabis: () => api.get('/members/hampir-habis'),
  getTransaksi: (id) => api.get(`/members/${id}/transaksi`),
};

export const paketApi = {
  getAll: (all = true) => api.get('/paket', { params: { all } }),
  getById: (id) => api.get(`/paket/${id}`),
  create: (data) => api.post('/paket', data),
  update: (id, data) => api.put(`/paket/${id}`, data),
  delete: (id) => api.delete(`/paket/${id}`),
};

export const transaksiApi = {
  create: (data) => api.post('/transaksi', data),
  getAll: (params) => api.get('/transaksi', { params }),
  updateStatus: (id, data) => api.patch(`/transaksi/${id}/status`, data),
};

export const perpanjanganApi = {
  getAll: (params) => api.get('/perpanjangan', { params }),
};

export const perusahaanApi = {
  getAll: () => api.get('/perusahaan'),
  getMe: () => api.get('/perusahaan/me'),
  create: (data) => api.post('/perusahaan', data),
  perpanjangLangganan: (id, data) => api.put(`/perusahaan/${id}/perpanjang-langganan`, data),
};

export const dashboardApi = {
  getRingkasan: () => api.get('/dashboard/ringkasan'),
};
