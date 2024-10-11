// Importando a conexão com o banco de dados
const db = require("../config/db");

// Função para listar todos os posts, incluindo públicos e os do usuário logado
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
      categories.name AS category_name 
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
      console.error('Erro na consulta SQL:', err); // Log do erro da consulta
      return res.status(500).json({ error: err.message });
    }

    // Organizar resultados para incluir comentários e categorias nos posts
    const postsWithDetails = results.reduce((acc, post) => {
      const { id, title, content, username, comment_id, comment_content, category_name } = post;

      // Encontra o post no acumulador
      let existingPost = acc.find(p => p.id === id);

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
        };
        acc.push(existingPost);
      }
      return acc;
    }, []);

    res.json(postsWithDetails); // Retorna posts com comentários e categorias
  });
};


// Função para obter um post específico por ID
// Função para obter um post pelo ID
// controllers/postController.js

exports.getPostById = (req, res) => {
  const postId = req.params.id;

  // Consulta para buscar o post e suas categorias
  const query = `
    SELECT 
      posts.*, 
      categories.name AS category_name 
    FROM posts 
    LEFT JOIN post_categories ON posts.id = post_categories.postId 
    LEFT JOIN categories ON post_categories.categoryId = categories.id 
    WHERE posts.id = ?
  `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar post:", err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Post não encontrado." });
    }

    // Organizar os dados do post para incluir as categorias
    const post = {
      ...results[0],
      categories: results.map(row => row.category_name).filter(Boolean) // Filtra apenas categorias existentes
    };

    res.status(200).json(post);
  });
};

// Função para criar um novo post
// controllers/postController.js

exports.createPost = (req, res) => {
  const { title, content, user_id, visibility, categoryId } = req.body;

  if (!title || !content || !user_id || !categoryId) {
    return res.status(400).json({ message: 'Title, content, user ID, and category are required.' });
  }

  const query = 'INSERT INTO posts (title, content, user_id, visibility) VALUES (?, ?, ?, ?)';
  const values = [title, content, user_id, visibility];

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Erro ao criar post:', error);
      return res.status(500).json({ message: 'Error creating post' });
    }

    const postId = result.insertId;

    // Associar a categoria ao post na tabela `post_categories`
    const categoryQuery = 'INSERT INTO post_categories (postId, categoryId) VALUES (?, ?)';
    db.query(categoryQuery, [postId, categoryId], (error) => {
      if (error) {
        console.error('Erro ao associar categoria ao post:', error);
        return res.status(500).json({ message: 'Post created, but error associating category.' });
      }

      res.status(201).json({
        message: 'Post created successfully!',
        post: { postId, title, content, user_id, visibility, categoryId }
      });
    });
  });
};


// Função para atualizar um post existente
exports.updatePost = (req, res) => {
  const { title, content, visibility, categoryIds } = req.body;
  const postId = req.params.id;

  // Verificação para garantir que o usuário que está atualizando é o dono do post
  db.query(
    "SELECT user_id FROM posts WHERE id = ?",
    [postId],
    (err, results) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0 || results[0].user_id !== req.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Atualizar o post
      db.query(
        "UPDATE posts SET title = ?, content = ?, visibility = ? WHERE id = ?",
        [title, content, visibility, postId],
        (err) => {
          if (err) {
            console.error('Erro ao atualizar o post:', err);
            return res.status(500).json({ error: err.message });
          }

          // Limpar associações antigas e adicionar novas categorias
          db.query(
            "DELETE FROM post_categories WHERE postId = ?",
            [postId],
            (err) => {
              if (err) {
                console.error('Erro ao deletar categorias do post:', err);
                return res.status(500).json({ error: err.message });
              }

              // Adicionar novas associações
              if (categoryIds && categoryIds.length > 0) {
                const values = categoryIds.map((categoryId) => [postId, categoryId]);
                db.query(
                  "INSERT INTO post_categories (postId, categoryId) VALUES ?",
                  [values],
                  (err) => {
                    if (err) {
                      console.error('Erro ao inserir novas categorias:', err);
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

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Primeiro, remover as referências na tabela post_categories
    const deleteReferencesQuery = 'DELETE FROM post_categories WHERE postId = ?';
    db.query(deleteReferencesQuery, [postId], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'Falha ao remover referências.' });
        });
      }

      // Agora, remover o post da tabela posts
      const deletePostQuery = 'DELETE FROM posts WHERE id = ?';
      db.query(deletePostQuery, [postId], (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        // Verifica se o post foi encontrado e excluído
        if (results.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: 'Post não encontrado.' });
          });
        }

        // Confirmar a transação
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Falha ao confirmar a transação.' });
            });
          }

          res.status(204).send(); // Sucesso, post excluído
        });
      });
    });
  });
};

