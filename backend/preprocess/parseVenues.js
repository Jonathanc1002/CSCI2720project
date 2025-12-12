const Venue = require("../models/Venue");
const resolveArea = require("./areaMapping");

function parseVenues(venuesXML) {
  const venues = venuesXML.venues.venue;

  return venues
    .filter(v => v.latitude && v.longitude)
    .map(v => ({
      venue_id: v.$.id,
      name: v.venuee || v.venuec || "Unknown",
      latitude: Number(v.latitude),
      longitude: Number(v.longitude),
      area: resolveArea(Number(v.latitude), Number(v.longitude))
    }));
}

/**
 * Filter venues by area, keyword (venue name), and/or distance from a reference point.
 * Supports filtering by area (Hong Kong Island, Kowloon, New Territories),
 * keyword search in venue names (case-insensitive), and distance radius in km.
 * Returns filtered venue list.
 */
function filterVenues(venues, filterOptions = {}) {
  let filtered = [...venues];

  // Filter by area if provided
  if (filterOptions.area && filterOptions.area.trim() !== "") {
    filtered = filtered.filter(v => 
      v.area && v.area.toLowerCase() === filterOptions.area.toLowerCase()
    );
  }

  // Filter by keyword (venue name) if provided
  if (filterOptions.keyword && filterOptions.keyword.trim() !== "") {
    const keyword = filterOptions.keyword.toLowerCase();
    filtered = filtered.filter(v => 
      v.name && v.name.toLowerCase().includes(keyword)
    );
  }

  // Filter by distance from reference point if provided (lat, lng, radiusKm)
  if (filterOptions.latitude !== undefined && filterOptions.longitude !== undefined && filterOptions.radiusKm !== undefined) {
    const refLat = Number(filterOptions.latitude);
    const refLng = Number(filterOptions.longitude);
    const radiusKm = Number(filterOptions.radiusKm);

    filtered = filtered.filter(v => {
      const distance = calculateDistance(refLat, refLng, v.latitude, v.longitude);
      return distance <= radiusKm;
    });
  }

  return filtered;
}

/**
 * Calculate distance between two coordinates using Haversine formula (in kilometers).
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = parseVenues;
module.exports.filterVenues = filterVenues;
module.exports.calculateDistance = calculateDistance;
