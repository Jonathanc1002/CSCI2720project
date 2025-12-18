import api from './api';
import { getCurrentUser } from './authService';

// Get current user ID from auth
const getUserId = () => {
  const user = getCurrentUser();
  return user?.userId || null;
};

// Get user's favorite locations
export const getMyFavorites = async () => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated');
    
    const response = await api.get(`/api/users/me/favorites?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

// Add location to favorites
export const addFavorite = async (venueId) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated');
    
    const response = await api.post(`/api/users/me/favorites/${venueId}`, {
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

// Remove location from favorites
export const removeFavorite = async (venueId) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated');
    
    const response = await api.delete(`/api/users/me/favorites/${venueId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// Check if a location is in favorites
export const checkIsFavorite = async (venueId) => {
  try {
    const favorites = await getMyFavorites();
    return favorites.some(fav => fav._id === venueId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
