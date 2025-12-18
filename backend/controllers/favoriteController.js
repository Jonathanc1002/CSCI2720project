const mongoose = require("mongoose");
const User = require("../models/User");
const Venue = require("../models/Venue");

/**
 * GET /api/users/me/favorites
 * query: ?userId=xxx or body: { userId }
 */
exports.getMyFavorites = async (req, res) => {
  try {
    console.log('getMyFavorites called', { query: req.query, body: req.body });
    // Accept userId from query params or body (body might be undefined for GET)
    const userId = req.query.userId || (req.body && req.body.userId);
    console.log('userId:', userId);
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    console.log('user found:', user ? user.username : 'null');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔴 핵심 수정: String → ObjectId 안전 변환
    const venueObjectIds = user.favoriteLocations
      .map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (venueObjectIds.length === 0) {
      return res.json([]);
    }

    const venues = await Venue.find({
      _id: { $in: venueObjectIds }
    });

    return res.json(
      venues.map(v => ({
        _id: v._id,
        name: v.name,
        latitude: v.latitude,
        longitude: v.longitude,
        area: v.area,
        eventsCount: v.eventCount ?? 0
      }))
    );
  } catch (err) {
    console.error("getMyFavorites error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



/**
 * POST /api/users/me/favorites/:venueId
 * body: { userId }
 */
exports.addFavorite = async (req, res) => {
  try {
    const { userId } = req.body;
    const { venueId } = req.params;

    if (!userId || !venueId) {
      return res.status(400).json({ message: "userId and venueId are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⭐ venueId = Venue._id
    if (!user.favoriteLocations.includes(venueId)) {
      user.favoriteLocations.push(venueId);
      await user.save();
    }

    return res.json({ message: "Favorite added" });
  } catch (err) {
    console.error("addFavorite error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/users/me/favorites/:venueId
 * body: { userId }
 */
exports.removeFavorite = async (req, res) => {
  try {
    const { userId } = req.body;
    const { venueId } = req.params;

    if (!userId || !venueId) {
      return res.status(400).json({ message: "userId and venueId are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⭐ _id 기준 제거
    user.favoriteLocations = user.favoriteLocations.filter(
      id => id.toString() !== venueId
    );
    await user.save();

    return res.json({ message: "Favorite removed" });
  } catch (err) {
    console.error("removeFavorite error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
