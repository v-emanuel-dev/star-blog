const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Ajuste conforme necessário

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;

    // Buscar o papel do usuário no banco de dados
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (error, results) => {
      if (error || results.length === 0) {
        return res.status(500).json({ error: 'Failed to retrieve user role' });
      }

      req.userRole = results[0].role;
      next();
    });
  });
};
