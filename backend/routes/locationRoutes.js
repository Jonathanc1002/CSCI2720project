// backend/routes/locationRoutes.js

const express = require("express");
const demoAuthMiddleware = require("../middleware/demoAuthMiddleware");

const {
  getAllLocations,
  getLocationById
} = require("../controllers/locationController");

const router = express.Router();

// 모든 location API는 로그인 필요
router.use(demoAuthMiddleware);

// GET /api/locations
router.get("/", getAllLocations);

// GET /api/locations/:id
router.get("/:id", getLocationById);

module.exports = router;
