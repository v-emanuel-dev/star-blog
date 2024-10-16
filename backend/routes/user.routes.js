const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', userController.getAllUsers); // Certifique-se de que esta rota corresponda ao seu endpoint

// Rota para atualizar o usuário com upload de imagem
router.put('/update/:id', verifyToken, upload.single('profilePicture'), userController.updateUser);

// Rota para obter um usuário pelo ID
router.get('/users/:id', verifyToken, userController.getUserById);

// Rota para deletar um usuário (apenas para admins)
router.delete('/users/:id', verifyToken, userController.deleteUser);

module.exports = router;
