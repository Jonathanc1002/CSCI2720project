const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  favoriteLocations: [{type: String}]
});

module.exports = mongoose.model("User", UserSchema);
