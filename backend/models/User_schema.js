const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  favoriteLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue"
  }]
});

module.exports = mongoose.model("User", UserSchema);
