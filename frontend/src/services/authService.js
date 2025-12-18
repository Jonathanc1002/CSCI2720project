import api from './api';

// Login user
export const login = async (username, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      username,
      password
    });
    
    // Store auth data in localStorage
    if (response.data.user && response.data.user._id) {
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('isAdmin', response.data.user.isAdmin);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage regardless of API call result
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  if (userId && username) {
    return { userId, username, isAdmin };
  }
  
  return null;
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('userId');
};

// Check if user is admin
export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};
