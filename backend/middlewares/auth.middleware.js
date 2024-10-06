const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extrai o token do cabeçalho

  if (!token) {
    return next(); // Permite acesso se não houver token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid token.'); // Retorna 403 se o token for inválido
    }

    req.userId = decoded.id; // Armazena o ID do usuário em req para uso posterior
    next(); // Chama o próximo middleware ou rota
  });
};
