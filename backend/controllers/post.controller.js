// Importando a conexão com o banco de dados
const db = require('../config/db');

// Função para listar todos os posts do usuário logado
exports.getAllPosts = (req, res) => {
  const userId = req.userId; // O ID do usuário vem do token JWT decodificado
  
  // Selecionar apenas os posts que pertencem ao usuário logado
  db.query('SELECT * FROM posts WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Retorna as postagens do usuário logado
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
exports.createPost = (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId; // Este ID vem do token JWT decodificado
  
  const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
  db.execute(query, [title, content, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating post' });
    }
    res.status(201).json({ message: 'Post created successfully' });
  });
};

// Função para atualizar um post existente
exports.updatePost = (req, res) => {
  const { title, content } = req.body;
  db.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send(); // Retorna 204 No Content em caso de sucesso
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
