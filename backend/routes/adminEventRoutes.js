const express = require('express');
const router = express.Router();
const demoAuthMiddleware = require('../middleware/demoAuthMiddleware');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');
const adminEventController = require('../controllers/adminEventController');

console.log('[ADMIN EVENT ROUTES] Loading with NEW configuration - GET /admin/events allows all authenticated users');

// GET events - all authenticated users can view
router.get('/admin/events', demoAuthMiddleware, (req, res, next) => {
  console.log('[ADMIN EVENT ROUTES] GET /admin/events handler hit - isAdmin:', req.isAdmin);
  next();
}, adminEventController.getAllEvents);

// Write operations - admin only
router.post('/admin/events', demoAuthMiddleware, adminOnlyMiddleware, adminEventController.createEvent);
router.put('/admin/events/:id', demoAuthMiddleware, adminOnlyMiddleware, adminEventController.updateEvent);
router.delete('/admin/events/:id', demoAuthMiddleware, adminOnlyMiddleware, adminEventController.deleteEvent);

module.exports = router;
