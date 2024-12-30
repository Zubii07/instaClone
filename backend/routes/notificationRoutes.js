const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

// Route to fetch notifications for a specific user
router.get("/:userId", notificationController.getNotifications);

// Route to delete a notification by ID
router.delete("/:id", notificationController.deleteNotification);

// Route to mark a notification as read
router.put(
  "/mark-as-read/:userId",
  notificationController.markNotificationsAsRead
);

module.exports = router;
