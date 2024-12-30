const multer = require("multer");
const { storage: cloudinaryStorage } = require("../config/cloudinaryConfig");
const path = require("path");

// File filter for validating file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG images, and MP4 videos are allowed."
      ),
      false
    );
  }
};

// Configure Multer
const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = upload;
