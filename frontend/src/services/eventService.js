import api from './api';

// Get all events
export const getAllEvents = async () => {
  try {
    const response = await api.get('/api/admin/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get events for a specific venue
export const getEventsByVenue = async (venueId) => {
  try {
    const allEvents = await getAllEvents();
    return allEvents.filter(event => event.venue === venueId);
  } catch (error) {
    console.error('Error fetching events by venue:', error);
    throw error;
  }
};
