const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authorizeUser = require("../middleware/authorizeUser");

// Register Route (Signup)
router.post("/register", userController.registerUser);

// Login Route (Authenticate)
router.post("/login", userController.authenticateUser);

// Profile Route
router.get("/profile", userController.getUserProfile);

// Logout Route
router.post("/logout", userController.logoutUser);

router.get("/:id", userController.getUser);

// Toggle privacy setting
router.put("/toggle-privacy", authorizeUser, userController.togglePrivacy);

module.exports = router;
