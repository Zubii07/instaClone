const { Like, Notification, User, Post } = require("../models");

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log("Post ID:", postId);
    const userId = req.user.id;
    console.log("id=", userId);

    // Check if like already exists
    const existingLike = await Like.findOne({ where: { postId, userId } });
    if (existingLike) {
      return res.status(400).json({ error: "Post already liked" });
    }

    // Add like
    const like = await Like.create({ postId, userId });

    // Send notification to the post owner (if not liking own post)
    const post = await Post.findByPk(postId);
    if (post.userId !== userId) {
      await Notification.create({
        userId: post.userId,
        message: `${req.user.username} liked your post.`,
        postId,
        type: "like",
        triggeredById: userId,
      });
    }

    res.status(201).json({ message: "Post liked", like });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({ where: { postId, userId } });

    if (!like) {
      return res.status(404).json({ error: "Like not found" });
    }

    await like.destroy();
    res.status(200).json({ message: "Post unliked" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Failed to unlike post" });
  }
};

exports.getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const likes = await Like.findAll({
      where: { postId },
      include: [{ model: User, as: "user", attributes: ["username"] }],
    });
    const likedByUser = likes.some((like) => like.userId === userId);

    res.status(200).json({ likes, likedByUser });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
};
