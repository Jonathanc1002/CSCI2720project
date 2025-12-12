const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserEvent",
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VenueEvent",
    required: true
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", CommentSchema);
