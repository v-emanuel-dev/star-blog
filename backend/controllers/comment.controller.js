const db = require("../config/db");

// Adicionar um novo comentário
exports.addComment = (req, res) => {
  const { content, postId, userId } = req.body; // Incluindo userId

  if (!content || !postId || !userId) {
    return res.status(400).json({ message: "Conteúdo, ID do post e ID do usuário são obrigatórios." });
  }

  const sql = "INSERT INTO comments (content, postId, user_id) VALUES (?, ?, ?)"; // Adicionando user_id
  db.query(sql, [content, postId, userId], (err, result) => {
    if (err) {
      console.error("Erro ao inserir comentário:", err);
      return res.status(500).json({ error: err.message });
    }

    const newComment = { id: result.insertId, content, postId, userId }; // Retorna o novo comentário
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
