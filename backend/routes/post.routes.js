const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller'); // Ensure the path is correct
const authMiddleware = require('../middlewares/auth.middleware'); // Middleware to verify token

// Routes for posts
router.post('/', authMiddleware.verifyToken, postController.createPost);
router.get('/', authMiddleware.verifyToken, postController.getAllPosts); // Check if the function is getAllPosts
router.get('/:id', authMiddleware.verifyToken, postController.getPostById); // Route to get post by ID
router.put('/:id', authMiddleware.verifyToken, postController.updatePost); // Route to update post
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost); // Route to delete post

module.exports = router; // Exporting the router
