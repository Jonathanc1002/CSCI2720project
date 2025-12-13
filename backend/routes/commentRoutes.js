// backend/routes/commentRoutes.js

const express = require("express");
const demoAuthMiddleware = require("../middleware/demoAuthMiddleware");
const {
  getCommentsByLocation,
  addCommentToLocation
} = require("../controllers/commentController");

const router = express.Router();

// 모든 comment API는 로그인 필요 (demo auth)
router.use(demoAuthMiddleware);

/**
 * GET /api/locations/:locationId/comments
 */
router.get(
  "/locations/:locationId/comments",
  getCommentsByLocation
);

/**
 * POST /api/locations/:locationId/comments
 */
router.post(
  "/locations/:locationId/comments",
  addCommentToLocation
);

module.exports = router;
