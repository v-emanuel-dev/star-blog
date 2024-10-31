const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const db = require("../config/db");
const { getSocket } = require("../socket");

router.get("/", commentController.getAllComments);

router.get("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const query = `
    SELECT comments.id, comments.content, comments.postId, comments.user_id, comments.username, comments.created_at, posts.visibility 
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
});

router.get("/:userId/notifications", (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM notifications WHERE userId = ?";
  db.query(sql, [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Error fetching notifications." });
    }
    res.status(200).json(results);
  });
});

router.post("/:userId/notifications", (req, res) => {
  const { message, postId } = req.body;
  const userId = req.params.userId;
  const sql =
    "INSERT INTO notifications (userId, message, postId) VALUES (?, ?, ?)";
  db.query(sql, [userId, message, postId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Error saving notification." });
    }
    res.status(201).json({ id: results.insertId, message, postId });
  });
});

router.post("/", (req, res) => {
  const { content, postId, userId, username } = req.body;
  if (!content || !postId || !username) {
    return res
      .status(400)
      .json({ error: "Content, postId, and username are required." });
  }

  db.query(
    "INSERT INTO comments (content, postId, user_id, username) VALUES (?, ?, ?, ?)",
    [content, postId, userId, username],
    (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Error creating comment" });
      }

      const newCommentId = result.insertId;

      db.query(
        "SELECT user_id FROM posts WHERE id = ?",
        [postId],
        (err, rows) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error getting post author." });
          }

          if (rows.length === 0) {
            return res.status(404).json({ error: "Post not found." });
          }

          const postAuthorId = rows[0].user_id;

          if (postAuthorId !== userId) {
            const io = getSocket();
            io.emit("new-comment", {
              postId: postId,
              content: content,
              author: userId,
            });

            const notificationMessage = `New comment on your post ${postId}: "${content}"`;
            db.query(
              "INSERT INTO notifications (userId, message, postId) VALUES (?, ?, ?)",
              [postAuthorId, notificationMessage, postId],
              (err) => {
                if (err) {
                  console.error("Error saving notification:", err);
                }
              }
            );
          }

          res
            .status(201)
            .json({ id: newCommentId, content, postId, userId, username });
        }
      );
    }
  );
});

router.put("/:id", (req, res) => {
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
});

router.delete("/notifications/:id", (req, res) => {
  const notificationId = req.params.id;

  const sql = "DELETE FROM notifications WHERE id = ?";
  db.query(sql, [notificationId], (error, result) => {
    if (error) {
      return res.status(500).json({ message: "Error removing notification." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res
      .status(200)
      .json({ message: "Notification removed successfully." });
  });
});

router.delete("/:id", (req, res) => {
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
    db.query(sqlDelete, [commentId], (err) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting comment." });
      }
      res.json({ message: "Comment deleted successfully!" });
    });
  });
});

module.exports = router;
