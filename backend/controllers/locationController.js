// backend/controllers/locationController.js

const Venue = require("../models/Venue");
const {
  loadFilteredVenuesFromDB,
  loadVenue
} = require("../services/venueServices");

/**
 * GET /api/locations
 * Logged-in users
 */
const getAllLocations = async (req, res) => {
  try {
    const filterOptions = {

      // Filters (optional)
      area: req.query.area,
      keyword: req.query.keyword,
      distance:
        req.query.distance !== undefined
          ? Number(req.query.distance)
          : undefined,
    };

    const [ok, data] = await loadFilteredVenuesFromDB(filterOptions);

    if (!ok) {
      console.error('loadFilteredVenuesFromDB error:', data);
      return res.status(500).json({
        message: 'Failed to load locations',
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('getAllLocations error:', err);
    return res.status(500).json({
      message: 'Failed to load locations',
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

    const [ok, result] = await loadVenue(id);

    if (!ok) {
      if (result === 'nofind') {
        return res.status(404).json({
          message: 'Location not found',
        });
      }

      console.error('loadVenue error:', result);
      return res.status(500).json({
        message: 'Failed to load location',
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('getLocationById error:', err);
    return res.status(500).json({
      message: 'Failed to load location',
    });
  }
};

module.exports = {
  getAllLocations,
  getLocationById
};
