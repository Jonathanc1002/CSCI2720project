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

module.exports = parseVenues
