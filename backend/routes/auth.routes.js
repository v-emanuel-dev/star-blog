const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const authenticateToken = require("../middlewares/auth-google.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const responseData = {
      token: token,
      accessToken: token,
      userId: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      userRole: user.role,
    };

    const frontendUrl = `http://localhost:4200/blog?token=${token}&accessToken=${token}&userId=${user.id}&email=${user.email}&username=${user.username}&profilePicture=${user.profilePicture}&userRole=${user.role}`;

    res.redirect(frontendUrl);
  }
);

router.post("/protected-route", authenticateToken, (req, res) => {
  res.json({
    message: "You are authorized to access this route.",
    user: req.user,
  });
});

router.get("/another-protected-route", verifyToken, (req, res) => {
  if (req.userId) {
    res.json({ message: "You are authorized.", userId: req.userId });
  } else {
    res.status(403).send("Access forbidden: no token provided.");
  }
});

module.exports = router;
