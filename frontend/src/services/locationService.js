import api from './api';

// Get all locations with optional filters
export const getAllLocations = async (filters = {}) => {
  try {
    const params = {};
    if (filters.area) params.area = filters.area;
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.distance !== undefined) params.distance = filters.distance;

    const response = await api.get('/api/locations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Get location by ID
export const getLocationById = async (id) => {
  try {
    const response = await api.get(`/api/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
};
