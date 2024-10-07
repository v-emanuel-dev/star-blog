const db = require("../config/db");

// Adicionar um novo comentário
exports.addComment = (req, res) => {
  const { postId, userId, content } = req.body;

  if (!postId || !userId || !content) {
    return res
      .status(400)
      .send({ message: "Todos os campos são obrigatórios." });
  }

  const query =
    "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
  db.query(query, [postId, userId, content], (err, result) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Erro ao adicionar o comentário.", error: err });
    }
    res.status(201).send({ id: result.insertId, postId, userId, content });
  });
};

// Obter comentários por post
exports.getCommentsByPostId = (req, res) => {
  const { postId } = req.params;

  const query = `
      SELECT comments.id, comments.content, comments.post_id, comments.user_id, comments.created_at, posts.visibility 
      FROM comments 
      JOIN posts ON comments.post_id = posts.id 
      WHERE post_id = ?
    `;

  db.query(query, [postId], (error, results) => {
    if (error) {
      console.error("Erro ao buscar comentários:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar comentários.", error });
    }

    console.log("Comentários encontrados:", results);
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
