const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the header

  if (!token) {
    return res.status(403).send('Token is required.'); // If the token is not provided
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid token.'); // If the token is invalid
    }

    req.userId = decoded.id; // Store the user ID in req for later use
    next(); // Call the next middleware or route
  });
};
