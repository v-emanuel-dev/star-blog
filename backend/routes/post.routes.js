const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware.verifyToken, postController.createPost);
router.get('/', authMiddleware.verifyToken, postController.getAllPosts);
router.get('/admin', authMiddleware.verifyToken, postController.getPostsAdmin); // Nova rota para posts do admin
router.get('/:id', authMiddleware.verifyToken, postController.getPostById);
router.put('/:id', authMiddleware.verifyToken, postController.updatePost);
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

module.exports = router;
