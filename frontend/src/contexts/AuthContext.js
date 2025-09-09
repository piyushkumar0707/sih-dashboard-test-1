import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user data in localStorage
    const savedUser = localStorage.getItem('traviraUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/login', { username, password });
      const data = res.data;
      if (data && data.token) {
        const userData = {
          ...data.user,
          token: data.token
        };
        setUser(userData);
        localStorage.setItem('traviraUser', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data?.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Connection error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('traviraUser');
    localStorage.removeItem('token');
  };

  // Get stored JWT token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Make authenticated API request using axios instance
  const apiRequest = async (url, options = {}) => {
    try {
      const method = options.method ? options.method.toLowerCase() : 'get';
      const config = {
        url,
        method,
        ...options,
      };
      if (options.body) config.data = options.body;
      const response = await api(config);
      return { data: response.data, response };
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
        return { error: 'Session expired. Please login again.' };
      }
      return { error: error.response?.data?.error || 'Network error' };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    getToken,
    apiRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
