// Example routes
const express = require('express');
const router = express.Router();
const { getUserById, createUser } = require('../controllers/userController');

// GET user by ID
router.get('/:id', getUserById);

// POST create user
router.post('/', createUser);

module.exports = router;
