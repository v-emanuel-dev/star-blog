const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Importando a conexão com o banco de dados
const { getSocket } = require('../socket'); // Importando a função para obter o Socket.io

// Rota para obter comentários por postId
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

  // Verifique se todos os dados necessários foram fornecidos
  if (!content || !postId) {
    return res.status(400).json({ error: 'Conteúdo e postId são obrigatórios.' });
  }  

  // Salvar o novo comentário no banco de dados
  db.query("INSERT INTO comments (content, postId, user_id) VALUES (?, ?, ?)", [content, postId, userId], (error, result) => {
    if (error) {
      console.error('Erro ao criar comentário:', error);
      return res.status(500).json({ error: 'Erro ao criar comentário' });
    }

    const newCommentId = result.insertId;

    // Verificar quem é o autor do post
    db.query("SELECT user_id FROM posts WHERE id = ?", [postId], (err, rows) => {
      if (err) {
        console.error('Erro ao obter autor do post:', err);
        return res.status(500).json({ error: 'Erro ao obter autor do post' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Post não encontrado.' });
      }

      const postAuthorId = rows[0].user_id;

      // Verificar se o autor do comentário é diferente do autor do post
      if (postAuthorId !== userId) {
        // Emitindo um evento para notificar sobre o novo comentário
        const io = getSocket(); // Obtém a instância do Socket.io
        io.emit('new-comment', {
          postId: postId,
          content: content,
          author: userId // Pode ser ajustado para incluir o nome do autor
        });

        // Criar uma notificação para o autor do post
        const notificationMessage = `Novo comentário no seu post ${postId}: "${content}"`;
        db.query("INSERT INTO notifications (userId, message, postId) VALUES (?, ?, ?)", [postAuthorId, notificationMessage, postId], (err) => {
          if (err) {
            console.error('Erro ao salvar notificação:', err);
          } else {
            console.log('Notificação salva com sucesso.');
          }
        });
      }

      // Retorne a resposta com o comentário criado
      res.status(201).json({ id: newCommentId, content, postId, userId });
    });
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

// Rota para remover uma notificação
router.delete('/notifications/:id', (req, res) => {
  const notificationId = req.params.id;

  const sql = 'DELETE FROM notifications WHERE id = ?';
  db.query(sql, [notificationId], (error, result) => {
    if (error) {
      console.error('Erro ao remover notificação:', error);
      return res.status(500).json({ message: 'Erro ao remover notificação.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notificação não encontrada.' });
    }

    return res.status(200).json({ message: 'Notificação removida com sucesso.' });
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

module.exports = router;
