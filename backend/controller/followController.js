const { Follow, User, Notification } = require("../models");
const notificationController = require("./notificationController");

exports.unfollowUser = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await Follow.destroy({ where: { followerId: userId, followingId: id } });

    const followingCount = await Follow.count({
      where: { followerId: userId, status: "accepted" },
    });
    const followersCount = await Follow.count({
      where: { followingId: id, status: "accepted" },
    });

    return res.json({
      message: "User unfollowed successfully",
      followingCount,
      followersCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  const { id } = req.params;

  try {
    const followers = await Follow.findAll({
      where: { followingId: id, status: "accepted" },
      include: [{ model: User, as: "Follower" }],
    });
    const count = await Follow.count({
      where: { followingId: id, status: "accepted" },
    });
    res.json({ followers, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFollowing = async (req, res) => {
  const { id } = req.params;

  try {
    const following = await Follow.findAll({
      where: { followerId: id, status: "accepted" },
      include: [{ model: User, as: "Following" }],
    });
    const count = await Follow.count({
      where: { followerId: id, status: "accepted" },
    });
    res.json({ following, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFollowUser = async (req, res) => {
  const { id } = req.params; // User to follow/unfollow
  const { userId } = req.body; // Logged-in user's ID

  try {
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Logged-in user ID is required." });
    }

    if (parseInt(userId) === parseInt(id)) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const userToFollow = await User.findOne({ where: { id } });

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId: userId, followingId: id },
    });

    if (existingFollow) {
      await Follow.destroy({ where: { followerId: userId, followingId: id } });

      const followingCount = await Follow.count({
        where: { followerId: userId, status: "accepted" },
      });
      const followersCount = await Follow.count({
        where: { followingId: id, status: "accepted" },
      });
      // Update both users' counts
      await User.update({ followingCount }, { where: { id: userId } });
      await User.update({ followersCount }, { where: { id } });
      return res.json({
        message: "User unfollowed successfully",
        following: false,
        followingCount,
        followersCount,
      });
    } else {
      const follower = await User.findOne({ where: { id: userId } });
      if (!follower) {
        return res.status(404).json({ message: "Follower not found." });
      }

      if (userToFollow.isPrivate) {
        // Private profile: Create a follow request
        await Follow.create({
          followerId: userId,
          followingId: id,
          status: "pending",
        });

        const message = `${follower.username} sent you a follow request.`;
        await notificationController.createNotification(
          "follow_request",
          message,
          id, // Recipient of the notification
          userId,
          null
        );

        return res.json({
          message: "Follow request sent successfully.",
          following: false,
          requestPending: true,
        });
      } else {
        // Public profile: Directly follow
        await Follow.create({
          followerId: userId,
          followingId: id,
          status: "accepted",
        });

        const followingCount = await Follow.count({
          where: { followerId: userId, status: "accepted" },
        });

        const followersCount = await Follow.count({
          where: { followingId: id, status: "accepted" },
        });
        // Update both users' counts
        await User.update({ followingCount }, { where: { id: userId } });
        await User.update({ followersCount }, { where: { id } });
        const message = `${follower.username} started following you.`;
        await notificationController.createNotification(
          "follow",
          message,
          id, // Recipient of the notification
          userId // Triggering user
        );

        return res.json({
          message: "User followed successfully.",
          following: true,
          followingCount,
          followersCount,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.manageFollowRequest = async (req, res) => {
  console.log("manageFollowRequest endpoint called");
  const { triggeredById, action } = req.body;
  const userId = req.user?.id; // Authenticated user's ID

  if (!triggeredById || !userId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const followRequest = await Follow.findOne({
      where: {
        followerId: triggeredById,
        followingId: userId,
        status: "pending",
      },
    });
    if (!followRequest) {
      return res.status(404).json({ message: "Follow request not found." });
    }

    if (followRequest.status !== "pending") {
      return res.status(404).json({ message: "Follow request not found." });
    }

    if (followRequest.followingId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to manage this follow request." });
    }

    if (action === "accept") {
      followRequest.status = "accepted";
      await followRequest.save();
      // update notification
      await Notification.update(
        { type: "follow" },
        {
          where: {
            triggeredById,
            userId: userId,
            type: "follow_request",
          },
        }
      );
      // Notify the follower about the accepted request
      const follower = await User.findByPk(followRequest.followerId);
      const message = `${follower.username} accepted your follow request.`;
      await notificationController.createNotification(
        "follow-accepted",
        message,
        followRequest.followerId,
        userId
      );

      return res.json({ message: "Follow request accepted." });
    } else if (action === "reject") {
      await followRequest.destroy();
      await Notification.update(
        { type: "rejected" },
        {
          where: {
            triggeredById,
            userId: userId,
            type: "follow_request",
          },
        }
      );
      return res.json({ message: "Follow request rejected." });
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFollowRequestStatus = async (req, res) => {
  const { followerId, followingId } = req.query;

  try {
    const followRequest = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (!followRequest) {
      return res.json({ status: null }); // No follow request exists
    }

    return res.json({ status: followRequest.status });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFollowersCount = async (req, res) => {
  const { id } = req.params; // ID of the user whose followers we want to fetch

  try {
    // Count the followers of the user
    const followersCount = await Follow.count({
      where: { followingId: id, status: "accepted" },
    });

    res.status(200).json({ followers: followersCount });
  } catch (error) {
    console.error("Error fetching followers count:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFollowingCount = async (req, res) => {
  const { id } = req.params;

  try {
    const followingCount = await Follow.count({
      where: { followerId: id, status: "accepted" },
    });
    res.status(200).json({ following: followingCount });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.isFollowing = async (req, res) => {
  const { followerId } = req.body;
  const { id: followingId } = req.params;

  if (!followerId || !followingId) {
    return res
      .status(400)
      .json({ error: "Follower ID and Following ID are required" });
  }

  if (followerId === followingId) {
    return res
      .status(400)
      .json({ error: "Follower ID and Following ID cannot be the same" });
  }
  try {
    // Check if a follow relationship exists
    const follow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (follow) {
      return res.status(200).json({ isFollowing: true });
    } else {
      return res.status(200).json({ isFollowing: false });
    }
  } catch (error) {
    console.error("Error checking follow status:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
