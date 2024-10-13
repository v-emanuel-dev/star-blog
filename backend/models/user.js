const db = require('../config/db');

const User = {
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error querying user by email:', err);
        return callback(err, null);
      }
      console.log('Query result for user by email:', results);
      callback(null, results[0]); // Retorna o primeiro usuário encontrado ou undefined
    });
  },

  create: ({ email, username, password, profilePicture }, callback) => {
    const query = 'INSERT INTO users (email, username, password, profilePicture) VALUES (?, ?, ?, ?)';
    db.query(query, [email, username, password, profilePicture], (err, results) => {
      if (err) {
        console.error('Error inserting new user:', err);
        return callback(err, null);
      }
      console.log('User successfully inserted:', results);
      callback(null, { id: results.insertId, email, username, profilePicture });
    });
  },

  findById: (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error querying user by ID:', err);
        return callback(err, null);
      }
      console.log('Query result for user by ID:', results);
      callback(null, results[0]);
    });
  },
};

module.exports = User;
