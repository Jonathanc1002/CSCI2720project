const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "N/A" },
  presenter: { type: String, required: true },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true
  },
  dates: {
    type: [Date],
    required: true
  }
});

module.exports = mongoose.model("Event", EventSchema);
