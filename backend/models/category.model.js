const db = require('../config/db');

const Category = {
  getAll: (callback) => {
    db.query('SELECT * FROM categories', callback);
  },
  getByPostId: (postId, callback) => {
    db.query('SELECT * FROM categories WHERE postId = ?', [postId], callback);
  },
  // Adicione outros métodos conforme necessário
};

module.exports = Category;
