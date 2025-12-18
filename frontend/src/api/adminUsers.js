//API functions for admin user management
import api from '../api';

export const getAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/api/admin/users', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};
