const db = require("../config/db");

// Get all categories
exports.getAllCategories = (req, res) => {
  const sql = "SELECT * FROM categories";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving categories:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

exports.getCategoriesByPostId = (req, res) => {
  const postId = Number(req.params.postId || req.query.postId); // Verifica se vem da rota ou da query

  if (isNaN(postId)) {
    return res.status(400).json({ error: "postId deve ser um número" });
  }

  const query = `
    SELECT c.* 
    FROM categories c 
    WHERE c.id IN (
      SELECT pc.categoryId 
      FROM post_categories pc 
      WHERE pc.postId = ? 
    );
  `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar categorias:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
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

  // Inserir a nova categoria na tabela categories
  const query = "INSERT INTO categories (name) VALUES (?)";
  const params = [name];

  db.query(query, params, (error, results) => {
    if (error) {
      console.error("Database connection failed: ", error.message);
      return res
        .status(500)
        .json({ message: "Database connection failed", error: error.message });
    }

    const categoryId = results.insertId; // ID da nova categoria

    // Agora insira a associação na tabela post_categories
    if (postId) {
      const associationQuery = "INSERT INTO post_categories (postId, categoryId) VALUES (?, ?)";
      db.query(associationQuery, [postId, categoryId], (assocError) => {
        if (assocError) {
          console.error("Error creating association:", assocError.message);
          return res.status(500).json({ message: "Failed to associate category", error: assocError.message });
        }
        console.log("Category created successfully with ID:", categoryId);
        res.status(201).json({
          message: "Category created successfully",
          categoryId: categoryId,
        });
      });
    } else {
      console.log("Category created successfully with ID:", categoryId);
      res.status(201).json({
        message: "Category created successfully",
        categoryId: categoryId,
      });
    }
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

exports.deleteCategoryFromPost = (req, res) => {
  const { postId, categoryId } = req.params;

  console.log(`Deleting category ID: ${categoryId} from post ID: ${postId}`); // Log dos IDs

  // Verificar se a associação existe
  const checkQuery = "SELECT * FROM post_categories WHERE postId = ? AND categoryId = ?";
  db.query(checkQuery, [postId, categoryId], (err, result) => {
    if (err) {
      console.error("Error checking association existence:", err); // Log de erro
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      console.warn("Association not found for post ID:", postId, "and category ID:", categoryId); // Log de aviso
      return res.status(404).json({ message: "Association not found." });
    }

    // Deletar a associação
    const deleteQuery = "DELETE FROM post_categories WHERE postId = ? AND categoryId = ?";
    db.query(deleteQuery, [postId, categoryId], (err) => {
      if (err) {
        console.error("Error deleting association:", err); // Log de erro
        return res.status(500).json({ error: err.message });
      }
      console.log(`Association deleted successfully for post ID: ${postId} and category ID: ${categoryId}`); // Log de sucesso
      res.status(204).send();
    });
  });
};


// Delete a category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  console.log("Deleting category ID:", id); // Log do ID da categoria

  const deleteAssociationsQuery = "DELETE FROM post_categories WHERE categoryId = ?";
  const deleteCategoryQuery = "DELETE FROM categories WHERE id = ?";

  db.query(deleteAssociationsQuery, [id], (err) => {
    if (err) {
      console.error("Error deleting associations:", err);
      return res.status(500).json({ error: err.message });
    }
    
    db.query(deleteCategoryQuery, [id], (err) => {
      if (err) {
        console.error("Error deleting category:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("Category deleted successfully for ID:", id);
      res.status(204).send();
    });
  });
};

