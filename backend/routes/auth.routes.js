const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Register a new user
router.post('/register', authController.register);

// Login a user
router.post('/login', authController.login);

// Rota para iniciar o login com o Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Rota de callback após o login do Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;

    // Criar o token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Criar um objeto com os dados que você deseja enviar
    const responseData = {
      token: token,
      userId: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
    };

    // Redirecionar para o frontend com os dados
    const frontendUrl = `http://localhost:4200/blog?token=${token}&userId=${user.id}&email=${user.email}&username=${user.username}&profilePicture=${user.profilePicture}`;
    res.redirect(frontendUrl);
  }
);

module.exports = router; // Exporting the router
