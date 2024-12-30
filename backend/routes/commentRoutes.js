const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  deleteComment,
  editComment,
} = require("../controller/commentController");
const authorizeUser = require("../middleware/authorizeUser");

router.post("/", authorizeUser, createComment);
router.get("/:postId", getCommentsByPost);
router.delete("/:id", authorizeUser, deleteComment);
router.put("/:id", authorizeUser, editComment);

module.exports = router;
