// backend/controllers/commentController.js

const Venue = require("../models/Venue");
const {
  loadComment,
  insertComment
} = require("../services/commentServices");

/**
 * GET /api/locations/:locationId/comments
 */
const getCommentsByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const venue = await Venue.findById(locationId).lean();
    if (!venue) {
      return res.status(404).json({ message: "Location not found" });
    }

    const [success, comments] = await loadComment(venue.venue_id);
    if (!success) {
      return res.status(500).json({ message: comments });
    }

    // FE-friendly response
    const response = comments.map(c => ({
      _id: c._id,
      comment: c.comment,
      username: c.username || "Anonymous",
      date: c.date
    }));

    return res.status(200).json(response);

  } catch (err) {
    console.error("getCommentsByLocation error:", err);
    return res.status(500).json({ message: "Failed to load comments" });
  }
};

/**
 * POST /api/locations/:locationId/comments
 * Body:
 * {
 *   userId: string (required),
 *   comment: string (required),
 *   username?: string (optional)
 * }
 */
const addCommentToLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { userId, comment, username } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!comment || typeof comment !== "string") {
      return res.status(400).json({ message: "Comment is required" });
    }

    const venue = await Venue.findById(locationId).lean();
    if (!venue) {
      return res.status(404).json({ message: "Location not found" });
    }

    const displayName =
      typeof username === "string" && username.trim()
        ? username.trim()
        : "Anonymous";

    const [success, created] = await insertComment(
      userId,
      {
        venue: { venue_id: venue.venue_id },
        comment,
        username: displayName
      }
    );

    if (!success) {
      return res.status(500).json({ message: created });
    }

    // FE-friendly response
    return res.status(201).json({
      _id: created._id,
      comment: created.comment,
      username: created.username,
      date: created.createdAt
    });

  } catch (err) {
    console.error("addCommentToLocation error:", err);
    return res.status(500).json({ message: "Failed to add comment" });
  }
};

module.exports = {
  getCommentsByLocation,
  addCommentToLocation
};
