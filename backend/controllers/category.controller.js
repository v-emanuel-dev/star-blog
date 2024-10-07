const db = require("../config/db");

// List all categories
exports.getAllCategories = (req, res) => {
  const query = "SELECT * FROM categories";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Create a new category
exports.createCategory = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const query = "INSERT INTO categories (name) VALUES (?)";
  db.query(query, [name], (error, results) => {
    if (error) {
      console.error("Error inserting category:", error);
      return res.status(500).json({ message: "Server error" });
    }
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

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  // Check if the category exists before updating
  const checkQuery = "SELECT * FROM categories WHERE id = ?";
  db.query(checkQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Update the category
    const updateQuery = "UPDATE categories SET name = ? WHERE id = ?";
    db.query(updateQuery, [name, id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(204).send();
    });
  });
};

// Delete a category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  // Check if the category exists before deleting
  const checkQuery = "SELECT * FROM categories WHERE id = ?";
  db.query(checkQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Delete the category
    const deleteQuery = "DELETE FROM categories WHERE id = ?";
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(204).send();
    });
  });
};
