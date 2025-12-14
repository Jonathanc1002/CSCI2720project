const express = require("express");
const router = express.Router();

const {
  getMyFavorites,
  addFavorite,
  removeFavorite
} = require("../controllers/favoriteController");

// v3 FE contract
router.get("/me/favorites", getMyFavorites);
router.post("/me/favorites/:venueId", addFavorite);
router.delete("/me/favorites/:venueId", removeFavorite);

module.exports = router;
