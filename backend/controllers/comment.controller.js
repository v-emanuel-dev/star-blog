const db = require("../config/db");

exports.getAllComments = (req, res) => {
  const query = 'SELECT * FROM comments';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar todos os comentários:', error);
      return res.status(500).json({ message: 'Erro ao buscar todos os comentários.', error });
    }
    res.json(results);
  });
};

// Adicionar um novo comentário
exports.addComment = (io) => (req, res) => {
  // Agora incluímos o username também
  const { content, postId, userId, username } = req.body; // Corrigido para 'username'

  console.log("Dados recebidos no backend:", {
    content,
    postId,
    userId,
    username, // Mudado para username
  });

  // Verificação do conteúdo, postId, e username (opcional para userId)
  if (!content || !postId || !username) {
    return res
      .status(400)
      .json({ message: "Conteúdo, ID do post e username são obrigatórios." });
  }

  // Validação adicional para garantir que os tipos estejam corretos
  if (
    typeof postId !== "number" ||
    typeof content !== "string" ||
    (userId !== null && typeof userId !== "number")
  ) {
    return res.status(400).json({ message: "Tipos de dados inválidos." });
  }

  // Query para inserir o comentário
  const sql =
    "INSERT INTO comments (content, postId, user_id, username) VALUES (?, ?, ?, ?)";
  db.query(sql, [content, postId, userId, username], (err, result) => {
    if (err) {
      console.error("Erro ao inserir comentário:", err);
      return res.status(500).json({ error: "Erro ao inserir comentário." });
    }

    const newComment = {
      id: result.insertId,
      content,
      postId,
      userId: userId || null,
      username, // Mudado para username
    };
    console.log("Comentário inserido com sucesso:", newComment);

    // Emitindo notificação para o autor do post (opcional)
    if (io && postAuthorId && newComment && newComment.id && content) {
      const notificationData = {
        postId,
        commentId: newComment.id,
        message: 'Você tem um novo comentário no seu post!',
        content,
      };
      io.to(`user_${postAuthorId}`).emit('new-comment', notificationData);
      console.log('Notificação enviada:', notificationData);
    } else {
      console.error('Dados incompletos para emitir a notificação:', {
        postAuthorId,
        newComment,
        content,
      });
    }

    return res.status(201).json(newComment);
  });
};

// Obter comentários por post
exports.getCommentsByPostId = (req, res) => {
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
      return res
        .status(500)
        .json({ message: "Erro ao buscar comentários.", error });
    }
    res.json(results);
  });
};

// Atualizar um comentário
exports.updateComment = (req, res) => {
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

    // Emitir notificação sobre o comentário atualizado (opcional)
    const io = getSocket(); // Obtém a instância do Socket.io
    io.emit('update-comment', { id: commentId, content });

    // Retorne o comentário atualizado
    const updatedComment = { id: commentId, content: content };
    return res.status(200).json(updatedComment);
  });
};

// Excluir comentário pelo ID
exports.deleteComment = (req, res) => {
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
};
