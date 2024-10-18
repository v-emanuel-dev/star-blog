// Importando a conexão com o banco de dados
const db = require("../config/db");

exports.getPostsAdmin = (req, res) => {
  const userRole = req.userRole; // Pega a role do usuário do token JWT decodificado

  // Verifica se o usuário é admin
  if (userRole !== "admin") {
    return res.status(403).json({ message: "Acesso negado" });
  }

  // Consulta SQL para buscar todos os posts, independentemente do usuário e da visibilidade
  const query = `
  SELECT 
    posts.*, 
    users.username, 
    comments.id AS comment_id, 
    comments.content AS comment_content, 
    categories.name AS category_name,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes
  FROM posts 
  JOIN users ON posts.user_id = users.id
  LEFT JOIN comments ON comments.postId = posts.id
  LEFT JOIN post_categories ON posts.id = post_categories.postId
  LEFT JOIN categories ON post_categories.categoryId = categories.id
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro na consulta SQL:", err);
      return res.status(500).json({ error: err.message });
    }

    // Organizar resultados para incluir comentários e categorias nos posts
    const postsWithDetails = results.reduce((acc, post) => {
      const {
        id,
        title,
        content,
        username,
        comment_id,
        comment_content,
        category_name,
      } = post;

      // Encontra o post no acumulador
      let existingPost = acc.find((p) => p.id === id);

      // Se o post já existe, apenas adiciona o comentário
      if (existingPost) {
        if (comment_content) {
          existingPost.comments.push({
            id: comment_id,
            content: comment_content,
          });
        }
      } else {
        // Se o post não existe, cria um novo post
        existingPost = {
          id,
          title,
          content,
          username,
          comments: comment_content
            ? [{ id: comment_id, content: comment_content }]
            : [],
          category: category_name || null,
          created_at: post.created_at,
          visibility: post.visibility,
          likes: post.likes || 0, // Adiciona a contagem de likes
        };
        acc.push(existingPost);
      }
      return acc;
    }, []);

    res.json(postsWithDetails);
  });
};

// Função para listar todos os posts, incluindo públicos e os do usuário logado
exports.getAllPosts = (req, res) => {
  const userId = req.userId; // O ID do usuário vem do token JWT decodificado

  // Consulta SQL para buscar posts, usuários, comentários e categorias
  const query = `
  SELECT 
    posts.*, 
    users.username, 
    comments.id AS comment_id, 
    comments.content AS comment_content, 
    categories.name AS category_name,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes
  FROM posts 
  JOIN users ON posts.user_id = users.id
  LEFT JOIN comments ON comments.postId = posts.id
  LEFT JOIN post_categories ON posts.id = post_categories.postId
  LEFT JOIN categories ON post_categories.categoryId = categories.id
  WHERE posts.visibility = 'public' 
    OR (posts.visibility = 'private' AND posts.user_id = ?)
`;

  const params = [userId];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erro na consulta SQL:", err); // Log do erro da consulta
      return res.status(500).json({ error: err.message });
    }

    // Organizar resultados para incluir comentários e categorias nos posts
    const postsWithDetails = results.reduce((acc, post) => {
      const {
        id,
        title,
        content,
        username,
        comment_id,
        comment_content,
        category_name,
      } = post;

      // Encontra o post no acumulador
      let existingPost = acc.find((p) => p.id === id);

      // Se o post já existe, apenas adiciona o comentário
      if (existingPost) {
        if (comment_content) {
          existingPost.comments.push({
            id: comment_id,
            content: comment_content,
          });
        }
      } else {
        // Se o post não existe, cria um novo post
        existingPost = {
          id,
          title,
          content,
          username,
          comments: comment_content
            ? [{ id: comment_id, content: comment_content }]
            : [],
          category: category_name || null, // Inclui o nome da categoria no post
          created_at: post.created_at,
          visibility: post.visibility,
          likes: post.likes || 0, // Adiciona a contagem de likes
        };
        acc.push(existingPost);
      }
      return acc;
    }, []);

    res.json(postsWithDetails); // Retorna posts com comentários e categorias
  });
};

// Função para obter um post específico por ID
exports.getPostById = (req, res) => { 
  const postId = req.params.id;

  // Consulta para buscar o post, suas categorias e a contagem de likes
  const query = `
    SELECT 
      posts.*, 
      categories.name AS category_name,
      COUNT(likes.id) AS likes
    FROM posts 
    LEFT JOIN post_categories ON posts.id = post_categories.postId 
    LEFT JOIN categories ON post_categories.categoryId = categories.id 
    LEFT JOIN likes ON likes.post_id = posts.id  -- Use o nome correto da coluna aqui
    WHERE posts.id = ?
    GROUP BY posts.id, categories.name
  `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar post:", err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Post não encontrado." });
    }

    // Organizar os dados do post para incluir as categorias e a contagem de likes
    const post = {
      ...results[0],
      categories: results.map((row) => row.category_name).filter(Boolean), // Filtra apenas categorias existentes
      likes: results[0].likes || 0 // Inclui a contagem de likes
    };

    res.status(200).json(post);
  });
};

// Função para criar um novo post
exports.createPost = (req, res) => {
  const { title, content, user_id, visibility, categoryIds } = req.body; // Mudança para categoryIds

  // Logando a requisição recebida
  console.log("Received request to create post:", {
    title,
    content,
    user_id,
    visibility,
    categoryIds,
  });

  // Verifica se os campos obrigatórios estão preenchidos
  if (
    !title ||
    !content ||
    !user_id ||
    !categoryIds ||
    categoryIds.length === 0
  ) {
    console.warn(
      "Validation error: Title, content, user ID, and at least one category are required."
    );
    return res.status(400).json({
      message:
        "Title, content, user ID, and at least one category are required.",
    });
  }

  // Insere o novo post na tabela posts
  const query =
    "INSERT INTO posts (title, content, user_id, visibility) VALUES (?, ?, ?, ?)";
  const values = [title, content, user_id, visibility];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ message: "Error creating post" });
    }

    const postId = result.insertId;
    console.log("Post created successfully with ID:", postId);

    // Prepara a query para associar múltiplas categorias ao post
    const categoryQueries = categoryIds.map((categoryId) => {
      return new Promise((resolve, reject) => {
        const categoryQuery =
          "INSERT INTO post_categories (postId, categoryId) VALUES (?, ?)";
        db.query(categoryQuery, [postId, categoryId], (error) => {
          if (error) {
            console.error("Error associating category to post:", error);
            reject(new Error("Error associating category"));
          } else {
            console.log(
              `Category with ID ${categoryId} associated with post ID ${postId}`
            );
            resolve();
          }
        });
      });
    });

    // Executa todas as associações de categorias
    Promise.all(categoryQueries)
      .then(() => {
        console.log("All categories associated successfully");
        return res
          .status(201)
          .json({ message: "Post created successfully", postId });
      })
      .catch((error) => {
        console.error("Error during category association:", error);
        return res
          .status(500)
          .json({ message: "Error associating categories" });
      });
  });
};

// Função para atualizar um post existente
exports.updatePost = (req, res) => {
  const { title, content, visibility, categoryIds } = req.body;
  const postId = req.params.id;

  // Verificação para garantir que o usuário que está atualizando é o dono do post ou um administrador
  db.query(
    "SELECT user_id FROM posts WHERE id = ?",
    [postId],
    (err, results) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err);
        return res.status(500).json({ error: err.message });
      }

      const isOwner = results.length > 0 && results[0].user_id === req.userId;
      const isAdmin = req.userRole === "admin"; // Supondo que `userRole` foi definido no middleware

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Atualizar o post
      db.query(
        "UPDATE posts SET title = ?, content = ?, visibility = ? WHERE id = ?",
        [title, content, visibility, postId],
        (err) => {
          if (err) {
            console.error("Erro ao atualizar o post:", err);
            return res.status(500).json({ error: err.message });
          }

          // Limpar associações antigas e adicionar novas categorias
          db.query(
            "DELETE FROM post_categories WHERE postId = ?",
            [postId],
            (err) => {
              if (err) {
                console.error("Erro ao deletar categorias do post:", err);
                return res.status(500).json({ error: err.message });
              }

              // Adicionar novas associações
              if (categoryIds && categoryIds.length > 0) {
                const values = categoryIds.map((categoryId) => [
                  postId,
                  categoryId,
                ]);
                db.query(
                  "INSERT INTO post_categories (postId, categoryId) VALUES ?",
                  [values],
                  (err) => {
                    if (err) {
                      console.error("Erro ao inserir novas categorias:", err);
                      return res.status(500).json({ error: err.message });
                    }
                    res.status(204).send();
                  }
                );
              } else {
                res.status(204).send();
              }
            }
          );
        }
      );
    }
  );
};

// Função para deletar um post por ID
exports.deletePost = (req, res) => {
  const postId = req.params.id; // ID do post a ser excluído

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Primeiro, remover as referências na tabela post_categories
    const deleteReferencesQuery =
      "DELETE FROM post_categories WHERE postId = ?";
    db.query(deleteReferencesQuery, [postId], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: "Falha ao remover referências." });
        });
      }

      // Agora, remover o post da tabela posts
      const deletePostQuery = "DELETE FROM posts WHERE id = ?";
      db.query(deletePostQuery, [postId], (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        // Verifica se o post foi encontrado e excluído
        if (results.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: "Post não encontrado." });
          });
        }

        // Confirmar a transação
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res
                .status(500)
                .json({ error: "Falha ao confirmar a transação." });
            });
          }

          res.status(204).send(); // Sucesso, post excluído
        });
      });
    });
  });
};

// Função para curtir/descurtir um post
exports.toggleLike = (req, res) => {
  const postId = req.params.id;
  const userId = req.userId; // O ID do usuário autenticado

  // Consulta para verificar se o post existe
  const queryCheckPost = `SELECT * FROM posts WHERE id = ?`;
  db.query(queryCheckPost, [postId], (err, results) => {
    if (err) {
      console.error("Erro ao verificar o post:", err);
      return res.status(500).json({ message: "Erro ao verificar o post" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    // Verifica se o usuário já deu like no post
    const queryCheckLike = `SELECT * FROM likes WHERE user_id = ? AND post_id = ?`;
    db.query(queryCheckLike, [userId, postId], (err, likeResults) => {
      if (err) {
        console.error("Erro ao verificar like:", err);
        return res.status(500).json({ message: "Erro ao verificar like" });
      }

      if (likeResults.length > 0) {
        // Se o like já existe, remove
        const queryDeleteLike = `DELETE FROM likes WHERE user_id = ? AND post_id = ?`;
        db.query(queryDeleteLike, [userId, postId], (err) => {
          if (err) {
            console.error("Erro ao remover like:", err);
            return res.status(500).json({ message: "Erro ao remover like" });
          }

          // Consulta a contagem total de likes
          const queryCountLikes = `SELECT COUNT(*) AS totalLikes FROM likes WHERE post_id = ?`;
          db.query(queryCountLikes, [postId], (err, countResults) => {
            if (err) {
              console.error("Erro ao contar likes:", err);
              return res.status(500).json({ message: "Erro ao contar likes" });
            }

            res.status(200).json({
              message: "Like removido com sucesso",
              likeCount: countResults[0].totalLikes,
            });
          });
        });
      } else {
        // Se o like não existe, adiciona
        const queryInsertLike = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;
        db.query(queryInsertLike, [userId, postId], (err) => {
          if (err) {
            console.error("Erro ao adicionar like:", err);
            return res.status(500).json({ message: "Erro ao adicionar like" });
          }

          // Consulta a contagem total de likes
          const queryCountLikes = `SELECT COUNT(*) AS totalLikes FROM likes WHERE post_id = ?`;
          db.query(queryCountLikes, [postId], (err, countResults) => {
            if (err) {
              console.error("Erro ao contar likes:", err);
              return res.status(500).json({ message: "Erro ao contar likes" });
            }

            res.status(200).json({
              message: "Like adicionado com sucesso",
              likeCount: countResults[0].totalLikes,
            });
          });
        });
      }
    });
  });
};
