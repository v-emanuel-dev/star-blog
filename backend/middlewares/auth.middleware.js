const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log("No token provided, proceeding as guest");
    req.userId = null;
    req.userRole = 'guest'; // Define como 'guest' para usuários não autenticados
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Failed to authenticate token:", err);
      req.userId = null;
      req.userRole = 'guest'; // Define como 'guest' em caso de erro de token
      return next();
    }

    req.userId = decoded.id;
    req.userRole = decoded.role; // Armazena a role do usuário
    next();
  });
};
