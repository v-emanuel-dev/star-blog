const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Importing the middleware

// Register a new user
router.post('/register', authController.register);

// Login a user
router.post('/login', authController.login);

// Update user information
router.put('/update', authMiddleware.verifyToken, authController.updateUser);

module.exports = router; // Exporting the router
