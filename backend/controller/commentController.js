const { Comment, Notification, User, Post } = require("../models");

exports.createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    console.log(postId, content);

    if (!postId || !content) {
      return res
        .status(400)
        .json({ error: "Post ID and content are required" });
    }
    // Use req.user.id from the middleware
    const userId = req.user.id;
    const comment = await Comment.create({
      userId,
      postId,
      content,
    });
    const post = await Post.findByPk(postId);
    if (post.userId !== userId) {
      await Notification.create({
        userId: post.userId,
        message: `${req.user.username} commented on your post.`,
        postId,
        type: "comment",
        triggeredById: userId,
      });
    }
    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.findAll({
      where: { postId },
      include: [{ model: User, as: "user", attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id; //  `req.user` contains the logged-in user

    const comment = await Comment.findOne({ where: { id, userId } });

    if (!comment) {
      return res
        .status(404)
        .json({ error: "Comment not found or not authorized" });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      where: { id },
      include: { model: Post, as: "post" },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ error: "Comment not found or not authorized" });
    }
    if (comment.userId !== userId && comment.post.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
