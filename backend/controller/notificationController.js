const { Notification, User } = require("../models");

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.findAll({
      where: { userId },
      include: [{ model: User, as: "TriggeredBy", attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createNotification = async (type, message, userId, triggeredById) => {
  try {
    const notificationData = {
      type,
      message,
      userId, // Recipient
      triggeredById, // Triggering user
      isRead: false,
    };

    const notification = await Notification.create(notificationData);
    console.log("Notification created successfully:", notification);
  } catch (err) {
    console.error("Error creating notification:", err);
    throw new Error("Failed to create notification");
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notification.destroy();

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markNotificationsAsRead = async (req, res) => {
  const { userId } = req.params; // Logged-in user's ID

  try {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } } // Update only unread notifications
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
