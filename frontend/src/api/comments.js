//comment endpoints
import api from '../api';

export const getComments = async (venueId) => {
  const response = await api.get(`/api/comments/${venueId}`);
  return response.data;
};

export const addComment = async (venueId, text) => {
  const response = await api.post('/api/comments', { venueId, text });
  return response.data;
};
