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

// Atualizar comentário pelo ID
router.put("/:id", (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ message: "O conteúdo do comentário é obrigatório." });
  }

  const sql = "UPDATE comments SET content = ? WHERE id = ?";
  db.query(sql, [content, commentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }

    // Retorne o comentário atualizado
    const updatedComment = { id: commentId, content: content };
    return res.status(200).json(updatedComment);
  });
});

// Excluir comentário pelo ID
router.delete("/:id", (req, res) => {
  const commentId = req.params.id;

  const sqlCheck = "SELECT * FROM comments WHERE id = ?";
  db.query(sqlCheck, [commentId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao buscar o comentário." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }

    const sqlDelete = "DELETE FROM comments WHERE id = ?";
    db.query(sqlDelete, [commentId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erro ao deletar o comentário." });
      }
      res.json({ message: "Comentário deletado com sucesso!" });
    });
  });
});

router.get('/post/:postId', (req, res) => {
  const { postId } = req.params;

  const query = `
    SELECT comments.id, comments.content, comments.postId, comments.user_id, comments.created_at, posts.visibility 
    FROM comments 
    JOIN posts ON comments.postId = posts.id 
    WHERE comments.postId = ?
  `;

  db.query(query, [postId], (error, results) => {
    if (error) {
      console.error("Erro ao buscar comentários:", error);
      return res.status(500).json({ message: "Erro ao buscar comentários.", error });
    }
    res.json(results);
  });
});

module.exports = router;
