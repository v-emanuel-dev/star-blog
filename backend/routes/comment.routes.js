const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");

// Adicionar um novo comentário
router.post("/", commentController.addComment);

// Obter comentários por post ID
router.get("/:postId", commentController.getCommentsByPostId);

// Rota para editar um comentário
router.put('/comments/:id', commentController.updateComment);

// Rota para deletar um comentário
router.delete('/:id', commentController.deleteComment);

module.exports = router;
