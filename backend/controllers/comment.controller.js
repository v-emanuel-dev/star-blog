const db = require("../config/db");

exports.getAllComments = (req, res) => {
  const query = "SELECT * FROM comments";

  db.query(query, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching all comments.", error });
    }
    res.json(results);
  });
};

exports.addComment = (io) => (req, res) => {
  const { content, postId, userId, username } = req.body;

  if (!content || !postId || !username) {
    return res
      .status(400)
      .json({ message: "Content, post ID, and username are required." });
  }

  if (
    typeof postId !== "number" ||
    typeof content !== "string" ||
    (userId !== null && typeof userId !== "number")
  ) {
    return res.status(400).json({ message: "Invalid data types." });
  }

  const sql =
    "INSERT INTO comments (content, postId, user_id, username) VALUES (?, ?, ?, ?)";
  db.query(sql, [content, postId, userId, username], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error inserting comment." });
    }

    const newComment = {
      id: result.insertId,
      content,
      postId,
      userId: userId || null,
      username,
    };

    if (io && postAuthorId) {
      const notificationData = {
        postId,
        commentId: newComment.id,
        message: "You have a new comment on your post!",
        content,
      };
      io.to(`user_${postAuthorId}`).emit("new-comment", notificationData);
    }

    return res.status(201).json(newComment);
  });
};

exports.getCommentsByPostId = (req, res) => {
  const { postId } = req.params;

  const query = `
    SELECT comments.id, comments.content, comments.postId, comments.user_id, comments.created_at, posts.visibility 
    FROM comments 
    JOIN posts ON comments.postId = posts.id 
    WHERE comments.postId = ?
  `;

  db.query(query, [postId], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching comments.", error });
    }
    res.json(results);
  });
};

exports.updateComment = (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required." });
  }

  const sql = "UPDATE comments SET content = ? WHERE id = ?";
  db.query(sql, [content, commentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const updatedComment = { id: commentId, content: content };
    return res.status(200).json(updatedComment);
  });
};

exports.deleteComment = (req, res) => {
  const commentId = req.params.id;

  const sqlCheck = "SELECT * FROM comments WHERE id = ?";
  db.query(sqlCheck, [commentId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching comment." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const sqlDelete = "DELETE FROM comments WHERE id = ?";
    db.query(sqlDelete, [commentId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting comment." });
      }
      res.json({ message: "Comment deleted successfully!" });
    });
  });
};
