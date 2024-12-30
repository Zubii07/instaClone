const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postController = require("../controller/postController");

router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming file upload:", req.files); // Log incoming files
    next();
  },
  upload.array("media", 10),
  postController.createPost
);
// Fetch all posts for the home feed
router.get("/", postController.getAllPosts);
// Fetch posts by a specific user
router.get("/user/:userId", postController.getUserPosts);

router.put("/:id/edit", postController.editPost);
router.delete("/:id/delete", postController.deletePost);

module.exports = router;
