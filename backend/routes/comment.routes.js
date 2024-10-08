const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");

// Adicionar um novo comentário
router.post("/", commentController.addComment);

// Obter comentários por post ID
router.get("/:postId", commentController.getCommentsByPostId);

// Rota para editar um comentário (verifique se essa linha está correta)
router.put("/:id", commentController.updateComment); // Remova 'comments' se for só ':id'

// Rota para deletar um comentário
router.delete("/:id", commentController.deleteComment);

module.exports = router;
