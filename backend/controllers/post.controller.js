// Importando a conexão com o banco de dados
const db = require("../config/db");


db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados com sucesso!');
  }
});

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
    LEFT JOIN categories ON posts.category_id = categories.id
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
exports.getPostById = (req, res) => {
  const userId = req.userId || null; // O ID do usuário, caso logado, do token JWT, ou null
  console.log("User ID:", userId); // Log do User ID

  // Query para selecionar o post e verificar a visibilidade
  const query = `
    SELECT posts.*, users.username 
    FROM posts 
    JOIN users ON posts.user_id = users.id
    WHERE posts.id = ? AND (posts.visibility = 'public' OR (posts.visibility = 'private' AND posts.user_id = ?))
  `;

  const params = [req.params.id, userId];
  console.log("Query params:", params); // Log dos parâmetros da consulta

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log("Query results:", results); // Log dos resultados da consulta
    if (results.length === 0) {
      return res
        .status(404)
        .json({
          error: "Post não encontrado ou você não tem permissão para visualizá-lo",
        });
    }
    res.json(results[0]); // Retorna o post encontrado
  });
};


// Função para criar um novo post
exports.createPost = (req, res) => {
  const { title, content, user_id, visibility, categoryId } = req.body;

  // Log dos dados recebidos
  console.log('Dados recebidos para criação do post:', { title, content, user_id, visibility, categoryId });

  // Verificar se todos os dados necessários estão presentes
  if (!title || !content || !user_id || !categoryId) {
    console.log('Dados ausentes na requisição:', { title, content, user_id, visibility, categoryId });
    return res.status(400).json({ message: 'Title, content, user ID, and category are required.' });
  }

  // Verificar se user_id é um número
  if (isNaN(user_id)) {
    console.log('User ID inválido:', user_id);
    return res.status(400).json({ message: 'User ID must be a valid number.' });
  }

  // Verificar se visibility está no conjunto permitido
  const allowedVisibilities = ['public', 'private'];
  if (!allowedVisibilities.includes(visibility)) {
    console.log('Visibilidade inválida:', visibility);
    return res.status(400).json({ message: 'Visibility must be either public or private.' });
  }

  // Inserir o post na base de dados com o ID da categoria
  const query = 'INSERT INTO posts (title, content, user_id, visibility, category_id) VALUES (?, ?, ?, ?, ?)';
  const values = [title, content, user_id, visibility, categoryId];
  
  // Log dos valores que serão inseridos
  console.log('Valores para inserção no banco de dados:', values);

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Erro ao criar post:', error); // Log no servidor
      return res.status(500).json({ message: 'Error creating post' }); // Mensagem genérica
    }

    const postId = result.insertId; // ID do post criado
    console.log('Post criado com sucesso:', postId);

    // Responder ao cliente com os dados do post
    res.status(201).json({
      message: 'Post created successfully!',
      post: {
        postId,
        title,
        content,
        user_id,
        visibility,
        categoryId,
        created_at: new Date().toISOString() // Data de criação
      }
    });
  });
};


// Função para atualizar um post existente
exports.updatePost = (req, res) => {
  const { title, content, visibility } = req.body;
  const postId = req.params.id;

  // Verificação para garantir que o usuário que está atualizando é o dono do post
  db.query(
    "SELECT user_id FROM posts WHERE id = ?",
    [postId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0 || results[0].user_id !== req.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      db.query(
        "UPDATE posts SET title = ?, content = ?, visibility = ? WHERE id = ?",
        [title, content, visibility, postId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(204).send();
        }
      );
    }
  );
};

// Função para deletar um post por ID
exports.deletePost = (req, res) => {
  const postId = req.params.id; // ID do post a ser excluído

  const query = 'DELETE FROM posts WHERE id = ?';
  const params = [postId];

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Post não encontrado.' });
    }

    res.status(204).send(); // Sucesso, post excluído
  });
};

