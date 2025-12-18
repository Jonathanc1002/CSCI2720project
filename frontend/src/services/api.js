import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to set auth header dynamically
api.interceptors.request.use((config) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  config.headers['x-user-is-admin'] = isAdmin ? 'true' : 'false';
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
