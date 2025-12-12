const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // TODO: ObjectId ref User
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", CommentSchema);
