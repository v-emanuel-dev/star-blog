const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Ajuste conforme necessário

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Failed to authenticate token:", err);
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;
    console.log("Decoded userId from token:", req.userId);

    // Buscar o papel do usuário no banco de dados
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (error, results) => {
      if (error || results.length === 0) {
        console.error("Failed to retrieve user role:", error);
        return res.status(500).json({ error: 'Failed to retrieve user role' });
      }

      req.userRole = results[0].role;
      console.log("User role retrieved:", req.userRole);
      next();
    });
  });
};
