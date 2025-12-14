const express = require('express');
const router = express.Router();
const demoAuthMiddleware = require('../middleware/demoAuthMiddleware');
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware');
const adminUserController = require('../controllers/adminUserController');

// Using middleware
router.use(demoAuthMiddleware, adminOnlyMiddleware);

router.get('/admin/users', adminUserController.getAllUsers);
router.post('/admin/users', adminUserController.createUser);
router.put('/admin/users/:id', adminUserController.updateUser);
router.delete('/admin/users/:id', adminUserController.deleteUser);

module.exports = router;
