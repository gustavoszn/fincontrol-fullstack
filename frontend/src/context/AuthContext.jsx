import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiRequest from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('fincontrol_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('fincontrol_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fincontrol_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fincontrol_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('fincontrol_token', token);
    } else {
      localStorage.removeItem('fincontrol_token');
    }
  }, [token]);

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUser(data.data.user);
      setToken(data.data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUser(data.data.user);
      setToken(data.data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token && user),
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
