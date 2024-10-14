const db = require("../config/db");

// Função para criar um novo post
exports.createPost = (req, res) => {
  const { title, content, user_id, visibility, categoryIds } = req.body;

  // Logando a requisição recebida
  console.log('Received request to create post:', { title, content, user_id, visibility, categoryIds });

  // Verifica se os campos obrigatórios estão preenchidos
  if (!title || !content || !user_id || !categoryIds || categoryIds.length === 0) {
    console.warn('Validation error: Title, content, user ID, and at least one category are required.');
    return res.status(400).json({ message: 'Title, content, user ID, and at least one category are required.' });
  }

  // Insere o novo post na tabela posts
  const query = 'INSERT INTO posts (title, content, user_id, visibility) VALUES (?, ?, ?, ?)';
  const values = [title, content, user_id, visibility];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ message: 'Error creating post' });
    }

    const postId = result.insertId;
    console.log('Post created successfully with ID:', postId);

    // Prepara a query para associar múltiplas categorias ao post
    const categoryQueries = categoryIds.map(categoryId => {
      return 'INSERT INTO post_categories (postId, categoryId) VALUES (?, ?)';
    });

    let index = 0;

    const insertCategory = () => {
      if (index >= categoryQueries.length) {
        return res.status(201).json({ message: 'Post created successfully', postId });
      }

      const categoryQuery = categoryQueries[index];
      const categoryValue = [postId, categoryIds[index]];

      db.query(categoryQuery, categoryValue, (error) => {
        if (error) {
          console.error('Error associating category to post:', error);
          return res.status(500).json({ message: 'Error associating category' });
        }

        console.log(`Category with ID ${categoryIds[index]} associated with post ID ${postId}`);
        index++;
        insertCategory(); // Chama novamente para o próximo
      });
    };

    insertCategory(); // Inicia a inserção das categorias
  });
};

// Outras funções (getAllPosts, getPostById, updatePost, deletePost) permanecem inalteradas


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
