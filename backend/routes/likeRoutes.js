const express = require("express");
const authorizeUser = require("../middleware/authorizeUser");
const router = express.Router();
const {
  likePost,
  unlikePost,
  getPostLikes,
} = require("../controller/likeController");

router.post("/:postId/like", authorizeUser, likePost);
router.delete("/:postId/unlike", authorizeUser, unlikePost);
router.get("/:postId/likes", authorizeUser, getPostLikes);

module.exports = router;
