// Importando a conexão com o banco de dados
const db = require('../config/db');

// Função para listar todos os posts, incluindo públicos e os do usuário logado
// Função para listar todos os posts, incluindo públicos e os do usuário logado
exports.getAllPosts = (req, res) => {
  const userId = req.userId; // O ID do usuário vem do token JWT decodificado

  // Selecionar posts públicos e posts do usuário logado
  const query = userId 
    ? 'SELECT * FROM posts WHERE visibility = "public" OR user_id = ?' 
    : 'SELECT * FROM posts WHERE visibility = "public"';

  const params = userId ? [userId] : [];

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Retorna os posts
  });
};

// Função para obter um post específico por ID
exports.getPostById = (req, res) => {
  db.query('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(results[0]); // Retorna o post encontrado
  });
};

// Função para criar um novo post
exports.createPost = async (req, res) => {
  const { title, content, visibility } = req.body;
  const userId = req.userId;

  // Verifica se title e content não estão vazios
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const query = 'INSERT INTO posts (title, content, user_id, visibility) VALUES (?, ?, ?, ?)';
    await db.execute(query, [title, content, userId, visibility]);
    res.status(201).json({ message: 'Post created successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Função para atualizar um post existente
exports.updatePost = (req, res) => {
  const { title, content, visibility } = req.body;
  const postId = req.params.id;

  // Verificação para garantir que o usuário que está atualizando é o dono do post
  db.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0 || results[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.query('UPDATE posts SET title = ?, content = ?, visibility = ? WHERE id = ?', [title, content, visibility, postId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(204).send();
    });
  });
};

// Função para deletar um post por ID
exports.deletePost = (req, res) => {
  db.query('DELETE FROM posts WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send(); // Retorna 204 No Content em caso de sucesso
  });
};
