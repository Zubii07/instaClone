const { Story, User } = require("../models");
const { Op } = require("sequelize");
const cron = require("node-cron");
const cloudinary = require("cloudinary").v2;

const jwt = require("jsonwebtoken");
const addStory = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID from JWT

    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const contentType = req.file.mimetype.startsWith("image/")
      ? "image"
      : "video";
    const contentUrl = req.file.path; // Cloudinary automatically provides the URL
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await Story.create({
      userId,
      contentType,
      contentUrl,
      expiresAt,
    });

    res.status(201).json({ message: "Story added!", story });
  } catch (error) {
    console.error("Error adding story:", error);
    res.status(500).json({ error: error.message });
  }
};

const getStories = async (req, res) => {
  try {
    const stories = await Story.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
    });

    res.status(200).json({ stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { id } = req.params;

    // Find the story to ensure the user owns it
    const story = await Story.findOne({ where: { id } });

    if (!story) {
      return res.status(404).json({ error: "Story not found." });
    }

    if (story.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this story." });
    }

    // Extract the Cloudinary public_id from the URL
    const publicId = story.contentUrl.split("/").pop().split(".")[0];

    // Delete the file from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete the story from the database
    await Story.destroy({ where: { id } });

    res.status(200).json({ message: "Story deleted!" });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteOldStories = async () => {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find stories older than 24 hours
    const oldStories = await Story.findAll({
      where: { createdAt: { [Op.lt]: cutoffTime } },
    });

    // Delete files from Cloudinary
    for (const story of oldStories) {
      const publicId = story.contentUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete old stories from the database
    await Story.destroy({ where: { createdAt: { [Op.lt]: cutoffTime } } });

    console.log("Old stories deleted!");
  } catch (error) {
    console.error("Error deleting old stories:", error.message);
  }
};

// Schedule a cron job to delete stories older than 24 hours every hour
cron.schedule("0 * * * *", deleteOldStories); // Runs at the start of every hour

module.exports = {
  addStory,
  getStories,
  deleteStory,
  deleteOldStories,
};
