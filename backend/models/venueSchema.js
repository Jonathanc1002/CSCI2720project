const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema({
  venue_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  area: { type: String },
  eventCount: { type: Number }
});

module.exports = mongoose.model("Venue", VenueSchema);
