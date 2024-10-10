const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

router.get("/all", categoryController.getAllCategories);

// Rota para listar todas as categorias (se necessário)
router.get("/", categoryController.getCategoriesByPostId);

// Rota para listar categorias por ID do post
// Exemplo de rota em Express
router.get('/post/:postId', categoryController.getCategoriesByPostId);

// Rota para criar uma nova categoria
router.post("/", categoryController.createCategory);

// Rota para atualizar uma categoria por ID
router.put("/:id", categoryController.updateCategory);

// Rota para deletar uma categoria por ID
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;