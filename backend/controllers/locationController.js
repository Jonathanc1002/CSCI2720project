// backend/controllers/locationController.js

const Venue = require("../models/Venue");

/**
 * GET /api/locations
 * Logged-in users
 */
const getAllLocations = async (req, res) => {
  try {
    const venues = await Venue.find({}).lean();

    const response = venues.map(v => ({
      _id: v._id,
      venue_id: v.venue_id,
      name: v.name,
      latitude: v.latitude,
      longitude: v.longitude,
      area: v.area,
      eventsCount: v.eventCount ?? 0
    }));

    return res.status(200).json(response);

  } catch (err) {
    console.error("getAllLocations error:", err);
    return res.status(500).json({
      message: "Failed to load locations"
    });
  }
};

/**
 * GET /api/locations/:id
 * id = Venue._id
 */
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await Venue.findById(id).lean();

    if (!venue) {
      return res.status(404).json({
        message: "Location not found"
      });
    }

    return res.status(200).json({
      _id: venue._id,
      venue_id: venue.venue_id,
      name: venue.name,
      latitude: venue.latitude,
      longitude: venue.longitude,
      area: venue.area,
      eventsCount: venue.eventCount ?? 0
    });

  } catch (err) {
    console.error("getLocationById error:", err);
    return res.status(500).json({
      message: "Failed to load location"
    });
  }
};

module.exports = {
  getAllLocations,
  getLocationById
};
