const { Post, PostImage, User } = require("../models");

exports.createPost = async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    // Get uploaded file URLs from Multer (Cloudinary paths if using Cloudinary)
    const mediaFiles = req.files.map((file) => file.path);

    if (!mediaFiles || mediaFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // Save post data to database
    const post = await Post.create({
      userId,
      title,
      content,
    });
    await User.increment("postCount", { where: { id: userId } });

    // Save media URLs to database
    const postImages = mediaFiles.map((url) => ({
      postId: post.id,
      imageUrl: url,
    }));
    await PostImage.bulkCreate(postImages);

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Failed to create post." });
  }
};

exports.editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, images, userId } = req.body;

    const post = await Post.findOne({ where: { id, userId } });

    if (!post) {
      return res
        .status(404)
        .json({ error: "Post not found or not authorized." });
    }

    await post.update({ title, content });

    if (images) {
      await PostImage.destroy({ where: { postId: id } });
      const postImages = images.map((url) => ({
        postId: id,
        imageUrl: url,
      }));
      await PostImage.bulkCreate(postImages);
    }

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findOne({ where: { id, userId } });

    if (!post) {
      return res
        .status(404)
        .json({ error: "Post not found or not authorized." });
    }

    await post.destroy();
    await User.decrement("postCount", { where: { id: userId } });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: PostImage, as: "images", attributes: ["imageUrl"] },
        { model: User, as: "user", attributes: ["username", "picture"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// get user specific posts with username
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.findAll({
      where: { userId },
      include: [{ model: PostImage, as: "images", attributes: ["imageUrl"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error.message);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};
