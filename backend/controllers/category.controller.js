const db = require("../config/db");

// Get all categories
exports.getAllCategories = (req, res) => {
  const sql = "SELECT * FROM categories";
  console.log('Executando consulta para buscar todas as categorias.');

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving categories:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Categorias recuperadas com sucesso:', results);
    res.status(200).json(results);
  });
};


// Get categories by post ID
// Exemplo de controlador de categorias
exports.getCategoriesByPostId = (req, res) => {
  const postId = req.params.postId;

  const query = 'SELECT * FROM categories WHERE postId = ?';
  db.query(query, [postId], (error, results) => {
    if (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ message: "Server error" });
    }
    
    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: "No categories found for this post." });
    }
  });
};

exports.createCategoryForPost = (req, res) => {
  const { categoryName, postId } = req.body;

  // Log dos dados recebidos
  console.log('Dados recebidos para associação de categoria ao post:', { categoryName, postId });

  // Verificar se os dados necessários estão presentes
  if (!categoryName || !postId) {
    console.log('Dados ausentes na requisição:', { categoryName, postId });
    return res.status(400).json({ message: 'Category name and post ID are required.' });
  }

  // Query para associar a categoria ao post
  const categoryQuery = 'INSERT INTO categories (name, postId) VALUES (?, ?)';
  const categoryValues = [categoryName, postId];

  console.log('Valores para inserção de categoria:', categoryValues);

  db.query(categoryQuery, categoryValues, (error) => {
    if (error) {
      console.error('Erro ao associar categoria ao post:', error);
      return res.status(500).json({ message: 'Post created, but error associating category.' });
    }

    console.log('Categoria associada ao post com sucesso:', { postId, categoryName });

    // Responder ao cliente após garantir que a categoria foi associada
    res.status(201).json({
      message: 'Category associated with post successfully.',
    });
  });
};


// Create a new category
exports.createCategory = (req, res) => {
  const { name, postId } = req.body; // Incluindo postId
  console.log("Data received for creating category:", req.body); // Log dos dados recebidos

  if (!name) {
      console.error("Category name is required."); // Log de erro
      return res.status(400).json({ message: "Category name is required" });
  }

  // Verifica se o postId é necessário
  const query = "INSERT INTO categories (name" + (postId ? ", postId" : "") + ") VALUES (?, ?)";
  const params = postId ? [name, postId] : [name]; // Adiciona o postId se necessário

  db.query(query, params, (error, results) => {
      if (error) {
        console.error("Database connection failed: ", err.message);
        return res.status(500).json({ message: "Database connection failed", error: err.message });
      }
      console.log("Category created successfully with ID:", results.insertId); // Log de sucesso
      res.status(201).json({
          message: "Category created successfully",
          categoryId: results.insertId,
      });
  });
};


// Update a category
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  console.log("Updating category ID:", id); // Log do ID da categoria

  if (!name) {
    console.error("Category name is required."); // Log de erro
    return res.status(400).json({ message: "Category name is required" });
  }

  // Check if the category exists before updating
  const checkQuery = "SELECT * FROM categories WHERE id = ?";
  db.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error checking category existence:", err); // Log de erro
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      console.warn("Category not found for ID:", id); // Log de aviso
      return res.status(404).json({ message: "Category not found." });
    }

    // Update the category
    const updateQuery = "UPDATE categories SET name = ? WHERE id = ?";
    db.query(updateQuery, [name, id], (err) => {
      if (err) {
        console.error("Error updating category:", err); // Log de erro
        return res.status(500).json({ error: err.message });
      }
      console.log("Category updated successfully for ID:", id); // Log de sucesso
      res.status(204).send();
    });
  });
};

// Delete a category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  console.log("Deleting category ID:", id); // Log do ID da categoria

  // Check if the category exists before deleting
  const checkQuery = "SELECT * FROM categories WHERE id = ?";
  db.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error checking category existence for deletion:", err); // Log de erro
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      console.warn("Category not found for deletion ID:", id); // Log de aviso
      return res.status(404).json({ message: "Category not found." });
    }

    // Delete the category
    const deleteQuery = "DELETE FROM categories WHERE id = ?";
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("Error deleting category:", err); // Log de erro
        return res.status(500).json({ error: err.message });
      }
      console.log("Category deleted successfully for ID:", id); // Log de sucesso
      res.status(204).send();
    });
  });
};
