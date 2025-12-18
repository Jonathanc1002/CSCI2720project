const express = require('express');
const router = express.Router();
const demoAuthMiddleware = require('../middleware/demoAuthMiddleware');
const Event = require('../models/Event');

console.log('[EVENT ROUTES] Module loaded - registering public event routes');

// Public endpoint - get all events (requires authentication but not admin)
router.get('/public-events', demoAuthMiddleware, async (req, res) => {
  try {
    console.log('[EVENT ROUTES] GET /public-events hit - isAdmin:', req.isAdmin);
    const events = await Event.find({});
    console.log('[EVENT ROUTES] Returning', events.length, 'events');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Public endpoint - get events by venue
router.get('/public-events/venue/:venueId', demoAuthMiddleware, async (req, res) => {
  try {
    console.log('[EVENT ROUTES] GET /public-events/venue/:venueId hit - isAdmin:', req.isAdmin, 'venueId:', req.params.venueId);
    const { venueId } = req.params;
    const events = await Event.find({ venue: venueId });
    console.log('[EVENT ROUTES] Found', events.length, 'events for venue', venueId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by venue:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
