const express = require("express");
const { login, logout } = require("../controllers/authController");
const demoAuthMiddleware = require("../middleware/demoAuthMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/logout", demoAuthMiddleware, logout);

module.exports = router;
