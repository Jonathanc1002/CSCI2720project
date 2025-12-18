//API functions for login/logout
import api from '../api';

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const getCurrentUser = () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (userId && username) {
    return { userId, username, isAdmin };
  }
  return null;
};

export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};
