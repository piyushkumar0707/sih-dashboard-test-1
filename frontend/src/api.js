// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Change if backend runs elsewhere

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to headers if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
