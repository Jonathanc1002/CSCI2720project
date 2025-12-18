import api from './api';
import { getCurrentUser } from './authService';

// Get comments for a location
export const getComments = async (locationId) => {
  try {
    const response = await api.get(`/api/locations/${locationId}/comments`);
    // Map backend response to frontend format
    return response.data.map(comment => ({
      _id: comment._id,
      text: comment.comment,
      username: comment.username,
      createdAt: comment.date
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Add a comment to a location
export const addComment = async (locationId, text) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await api.post(`/api/locations/${locationId}/comments`, {
      userId: user.userId,
      username: user.username,
      comment: text
    });
    
    // Map backend response to frontend format
    return {
      _id: response.data._id,
      text: response.data.comment,
      username: response.data.username,
      createdAt: response.data.date
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
