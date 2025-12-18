//API functions for location endpoints
import api from "../api";

// GET /api/locations
export const getLocations = (params = {}) => {
  return api.get("/api/locations", { params });
};

// GET /api/locations/:id
export const getLocationById = (id) => {
  return api.get(`/api/locations/${id}`);
};
