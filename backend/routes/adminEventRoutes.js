const express = require('express');
const router = express.Router();
const demoAuthMiddleware = require('../middleware/demoAuthMiddleware');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');
const adminEventController = require('../controllers/adminEventController');

// Using middleware
router.use(demoAuthMiddleware, adminOnlyMiddleware);

router.get('/admin/events', adminEventController.getAllEvents);
router.post('/admin/events', adminEventController.createEvent);
router.put('/admin/events/:id', adminEventController.updateEvent);
router.delete('/admin/events/:id', adminEventController.deleteEvent);

module.exports = router;
