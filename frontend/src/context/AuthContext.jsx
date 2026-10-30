import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ruang_laundry_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ruang_laundry_token');
      const storedUser = localStorage.getItem('ruang_laundry_user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('ruang_laundry_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Sesi login kedaluwarsa:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res.success && res.data) {
      const { token: newToken, admin } = res.data;
      setToken(newToken);
      setUser(admin);
      localStorage.setItem('ruang_laundry_token', newToken);
      localStorage.setItem('ruang_laundry_user', JSON.stringify(admin));
      return res;
    }
    throw new Error(res.message || 'Login gagal');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ruang_laundry_token');
    localStorage.removeItem('ruang_laundry_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
