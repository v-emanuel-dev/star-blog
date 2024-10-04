const db = require('../config/db');

const Post = {
  // Método para criar um post
  create: (newPost, callback) => {
    const query = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    db.query(query, [newPost.title, newPost.content], (err, result) => {
      if (err) {
        console.error('Erro ao criar post:', err);
        return callback(err, null);
      }
      callback(null, { id: result.insertId, ...newPost });
    });
  },

  // Método para atualizar um post
  update: (id, updatedPost, callback) => {
    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    db.query(query, [updatedPost.title, updatedPost.content, id], (err, result) => {
      if (err) {
        console.error('Erro ao atualizar post:', err);
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(null, { message: 'Post não encontrado' });
      }
      callback(null, { id, ...updatedPost });
    });
  },

  // Método para buscar um post pelo ID
  findById: (id, callback) => {
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Erro ao buscar post:', err);
        return callback(err, null);
      }
      if (results.length > 0) {
        callback(null, results[0]); // Retorna o primeiro resultado
      } else {
        callback(null, null); // Nenhum post encontrado
      }
    });
  },

  // Outros métodos, se houver...
};

module.exports = Post; // Exportando como um objeto
