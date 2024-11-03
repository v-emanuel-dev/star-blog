const db = require("../config/db");

exports.createCart = (req, res) => {
  const { userId } = req.body;
  console.log("Attempting to create cart for user ID:", userId);

  if (!userId) {
    console.error("User ID is required");
    return res.status(400).json({ message: "User ID is required" });
  }

  db.query(
    "INSERT INTO carts (userId) VALUES (?)",
    [userId],
    (error, result) => {
      if (error) {
        console.error("Error creating cart:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      console.log("Cart created successfully, cart ID:", result.insertId);
      res
        .status(201)
        .json({
          message: "Cart created successfully",
          cartId: result.insertId,
        });
    }
  );
};

exports.getCartByUserId = (req, res) => {
  const { userId } = req.params;
  console.log("Fetching cart for user ID:", userId);

  db.query("SELECT * FROM carts WHERE userId = ?", [userId], (error, carts) => {
    if (error) {
      console.error("Error fetching user cart:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (carts.length === 0) {
      console.warn("No cart found for user ID:", userId);
      return res.status(404).json({ message: "No cart found for this user" });
    }
    res.json(carts[0]);
  });
};

exports.getCartItems = (req, res) => {
  const { userId } = req.params;
  console.log("Fetching cart items for user ID:", userId);

  db.query(
    "SELECT * FROM cart_items WHERE userId = ?",
    [userId],
    (error, items) => {
      if (error) {
        console.error("Error fetching cart items:", error);
        return res
          .status(500)
          .json({ message: "Error fetching cart items", error: error.message });
      }
      console.log("Cart items found:", items);
      res.json(items);
    }
  );
};

exports.addItemToCart = (req, res) => {
  const { postId, userId, quantity } = req.body;
  const cartId = userId;

  console.log("Adding item to cart:", { postId, userId, quantity, cartId });

  // Primeiro verifica se o item já existe no carrinho
  db.query(
    "SELECT * FROM cart_items WHERE postId = ? AND userId = ?",
    [postId, userId],
    (error, items) => {
      if (error) {
        console.error("Error fetching cart item:", error);
        return res.status(500).json({ message: "Error fetching cart item", error: error.message });
      }

      if (items.length > 0) {
        // Se o item já existe, incrementa a quantidade
        const existingItem = items[0];
        const newQuantity = existingItem.quantity + quantity;

        db.query(
          "UPDATE cart_items SET quantity = ? WHERE id = ?",
          [newQuantity, existingItem.id],
          (updateError) => {
            if (updateError) {
              console.error("Error updating item quantity:", updateError);
              return res.status(500).json({ message: "Error updating item quantity" });
            }
            console.log("Item quantity updated successfully to:", newQuantity);
            res.status(200).json({
              message: "Item quantity updated successfully",
              itemId: existingItem.id,
              newQuantity: newQuantity
            });
          }
        );
      } else {
        // Se o item não existe, cria uma nova entrada
        db.query(
          "INSERT INTO cart_items (postId, userId, quantity, cartId) VALUES (?, ?, ?, ?)",
          [postId, userId, quantity, cartId],
          (insertError, result) => {
            if (insertError) {
              console.error("Error adding item to cart:", insertError);
              return res.status(500).json({ message: "Error adding item to cart", error: insertError.message });
            }
            console.log("Item added to cart successfully:", { itemId: result.insertId });
            res.status(200).json({
              message: "Item added to cart successfully",
              itemId: result.insertId
            });
          }
        );
      }
    }
  );
};

exports.updateCartItemQuantity = (req, res) => {
  const itemId = req.params.id; // Pegando o ID da URL
  const { newQuantity } = req.body;
  
  console.log("Updating item quantity:", { itemId, newQuantity });

  if (!itemId || newQuantity === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (newQuantity <= 0) {
    // Se a quantidade for 0 ou menor, remove o item
    db.query(
      "DELETE FROM cart_items WHERE id = ?",
      [itemId],
      (deleteError) => {
        if (deleteError) {
          console.error("Error deleting item:", deleteError);
          return res.status(500).json({ message: "Error deleting item" });
        }
        console.log("Item removed from cart successfully:", itemId);
        res.status(200).json({ message: "Item removed from cart", itemId });
      }
    );
  } else {
    // Caso contrário, atualiza a quantidade
    db.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [newQuantity, itemId],
      (updateError) => {
        if (updateError) {
          console.error("Error updating item quantity:", updateError);
          return res.status(500).json({ message: "Error updating item quantity" });
        }
        console.log("Item quantity updated successfully to:", newQuantity);
        res.status(200).json({
          message: "Item quantity updated successfully",
          itemId,
          newQuantity
        });
      }
    );
  }
};
  
  exports.updateItemQuantity = (req, res) => {
    const { itemId } = req.params;
    const { newQuantity } = req.body;
    
    console.log('Request params:', { itemId });
    console.log('Request body:', req.body);

    if (!itemId || !newQuantity) {
        return res.status(400).json({ 
            message: 'Missing required fields',
            received: { itemId, newQuantity }
        });
    }

    db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, itemId],
        (error, result) => {
            if (error) {
                console.error('Error updating item quantity:', error);
                return res.status(500).json({ message: 'Error updating item quantity' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }

            console.log('Item quantity updated successfully to:', newQuantity);
            return res.status(200).json({
                message: 'Item quantity updated successfully',
                itemId: parseInt(itemId),
                newQuantity: parseInt(newQuantity)
            });
        }
    );
};

exports.removeItemFromCart = (req, res) => {
    const itemId = req.params.id; // Obtendo o ID do parâmetro da requisição

    // Validação do ID
    if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required' });
    }

    const parsedId = parseInt(itemId, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ message: 'Invalid item ID format' });
    }

    // Consultar para verificar se o item existe
    const checkQuery = 'SELECT id FROM cart_items WHERE id = ?';
    db.query(checkQuery, [parsedId], (checkError, results) => {
        if (checkError) {
            return res.status(500).json({ message: 'Database error', error: checkError.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found', itemId: parsedId });
        }

        // Excluir o item
        const deleteQuery = 'DELETE FROM cart_items WHERE id = ?';
        db.query(deleteQuery, [parsedId], (deleteError, deleteResult) => {
            if (deleteError) {
                return res.status(500).json({ message: 'Error deleting item', error: deleteError.message });
            }

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Item not found or already deleted', itemId: parsedId });
            }

            return res.status(200).json({ message: 'Item successfully removed from cart', itemId: parsedId });
        });
    });
};

