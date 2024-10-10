const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware'); // Importe o middleware aqui

// Rota para atualizar o usuário com upload de imagem
router.put('/update/:id', verifyToken, upload.single('profilePicture'), userController.updateUser);
router.get('/users/:id', userController.getUserById);

module.exports = router;
