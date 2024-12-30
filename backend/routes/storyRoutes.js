const express = require("express");
const router = express.Router();
const storyController = require("../controller/storyController");
const upload = require("../middleware/multer");

// Add a new story
router.post("/add", upload.single("story"), storyController.addStory);

// Get all stories
router.get("/", storyController.getStories);

// Delete a story by ID
router.delete("/delete/:id", storyController.deleteStory);

// Delete stories older than 24 hours
router.delete("/delete-old", storyController.deleteOldStories);

module.exports = router;
