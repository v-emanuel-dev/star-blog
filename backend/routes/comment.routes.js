const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Importando a conexão com o banco de dados
const { getSocket } = require('../socket'); // Importando a função para obter o Socket.io

// Obter comentários por post ID
router.get("/:postId", (req, res) => {
  // Implemente a lógica para obter comentários por postId
});

// Rota para editar um comentário
router.put("/:id", (req, res) => {
  // Implemente a lógica para editar um comentário
});

// Rota para deletar um comentário
router.delete("/:id", (req, res) => {
  // Implemente a lógica para deletar um comentário
});

// Rota para criar um novo comentário
router.post('/', (req, res) => {
  const { content, postId, userId } = req.body;

  db.query("INSERT INTO comments (content, postId, user_id) VALUES (?, ?, ?)", [content, postId, userId], (error, result) => {
    if (error) {
      console.error('Erro ao criar comentário:', error);
      return res.status(500).json({ error: 'Erro ao criar comentário' });
    }

    const newCommentId = result.insertId;

    // Emitindo um evento para notificar sobre o novo comentário
    const io = getSocket(); // Obtém a instância do Socket.io
    io.emit('new-comment', {
      postId: postId,
      content: content,
      author: userId // ou outra lógica para obter o autor
    });

    res.status(201).json({ id: newCommentId, content, postId, userId });
  });
});

module.exports = router;
