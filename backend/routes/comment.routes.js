const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Importando a conexão com o banco de dados
const { getSocket } = require('../socket'); // Importando a função para obter o Socket.io

// Rota para obter notificações de um usuário
router.get('/:userId/notifications', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT * FROM notifications WHERE userId = ?';

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return res.status(500).json({ message: 'Erro ao buscar notificações.' });
    }
    res.status(200).json(results);
  });
});

// Rota para criar uma nova notificação
router.post('/:userId/notifications', (req, res) => {
  const { message, postId } = req.body;
  const userId = req.params.userId;

  const sql = 'INSERT INTO notifications (userId, message, postId) VALUES (?, ?, ?)';
  db.query(sql, [userId, message, postId], (error, results) => {
    if (error) {
      console.error('Erro ao salvar notificação:', error);
      return res.status(500).json({ message: 'Erro ao salvar notificação.' });
    }
    res.status(201).json({ id: results.insertId, message, postId });
  });
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
      author: userId // Lógica para obter o autor
    });

    // Criar uma notificação
    const notificationMessage = `Novo comentário no post ${postId}: "${content}"`;
    db.query("INSERT INTO notifications (userId, message, postId) VALUES (?, ?, ?)", [userId, notificationMessage, postId], (err) => {
      if (err) {
        console.error('Erro ao salvar notificação:', err);
      } else {
        console.log('Notificação salva com sucesso.');
      }
    });

    res.status(201).json({ id: newCommentId, content, postId, userId });
  });
});

// Rota para atualizar um comentário (placeholder)
router.put("/:id", (req, res) => {
  // Lógica para atualizar um comentário
});

// Rota para deletar um comentário (placeholder)
router.delete("/:id", (req, res) => {
  // Lógica para deletar um comentário
});

// Rota para obter um comentário específico (placeholder)
router.get("/:postId", (req, res) => {
  // Lógica para obter um comentário específico
});

module.exports = router;
