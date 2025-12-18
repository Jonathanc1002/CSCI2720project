//(optional but for now) favorites api calls
import api from '../api';

export const getMyFavorites = async () => {
  const response = await api.get('/api/favorites');
  return response.data;
};

export const addFavorite = async (venueId) => {
  const response = await api.post('/api/favorites', { venueId });
  return response.data;
};

export const removeFavorite = async (venueId) => {
  const response = await api.delete(`/api/favorites/${venueId}`);
  return response.data;
};

export const checkIsFavorite = async (venueId) => {
  const response = await api.get(`/api/favorites/${venueId}`);
  return response.data.isFavorite;
};
