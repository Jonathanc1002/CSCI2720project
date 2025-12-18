//API functions for admin event management
import api from '../api';

export const getAllEvents = async () => {
  const response = await api.get('/api/admin/events');
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/api/admin/events', eventData);
  return response.data;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/api/admin/events/${eventId}`, eventData);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/api/admin/events/${eventId}`);
  return response.data;
};
