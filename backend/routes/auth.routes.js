const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Middlewares de autenticação
const authenticateToken = require("../middlewares/auth-google.middleware");
const { verifyToken } = require("../middlewares/auth.middleware"); // Supondo que o segundo middleware esteja no mesmo arquivo

// Register a new user
router.post("/register", authController.register);

// Login a user
router.post("/login", authController.login);

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

    // Log do objeto user
    console.log("User after authentication:", user);

    // Criar o token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Use user.role aqui
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Criar um objeto com os dados que você deseja enviar
    const responseData = {
      token: token,
      accessToken: token, // Enviando também como accessToken
      userId: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      userRole: user.role, // Use user.role aqui
    };

    // Redirecionar para o frontend com os dados, incluindo o accessToken
    const frontendUrl = `http://localhost:4200/blog?token=${token}&accessToken=${token}&userId=${user.id}&email=${user.email}&username=${user.username}&profilePicture=${user.profilePicture}&userRole=${user.role}`;

    res.redirect(frontendUrl);
  }
);

// Rota protegida que requer autenticação
router.post("/protected-route", authenticateToken, (req, res) => {
  // Esta rota está protegida, então a autenticação foi bem-sucedida
  res.json({
    message: "You are authorized to access this route.",
    user: req.user,
  });
});

// Rota que utiliza verifyToken
router.get("/another-protected-route", verifyToken, (req, res) => {
  if (req.userId) {
    // O usuário está autenticado
    res.json({ message: "You are authorized.", userId: req.userId });
  } else {
    res.status(403).send("Access forbidden: no token provided.");
  }
});

module.exports = router; // Exportando o router
