const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dynamic Cloudinary Storage
const getDynamicFolder = (req) => {
  // Use "stories" for story uploads, and "posts" for post uploads
  const folder = req.path.includes("stories") ? "stories" : "posts";
  return folder;
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: getDynamicFolder(req), // Dynamically set folder
    allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4"],
    resource_type: "auto",
  }),
});

module.exports = { cloudinary, storage };
