const express = require("express");
const router = express.Router();
const {
  uploadProfilePicture,
  deleteProfilePicture,
} = require("../controller/ProfilePictureController");
const upload = require("../middleware/multer");
const authorizeUser = require("../middleware/authorizeUser");

router.post(
  "/profile-picture/:id",
  authorizeUser,
  upload.single("picture"),
  uploadProfilePicture
);

router.delete(
  "/delete-profile-picture/:id",
  authorizeUser,
  deleteProfilePicture
);

module.exports = router;
