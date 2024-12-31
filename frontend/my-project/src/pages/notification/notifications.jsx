import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const Notifications = () => {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const { showToast } = useToast();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/notifications/${user.id}`,
          { withCredentials: true }
        );
        console.log("Notifications:", response.data); // Debug log
        setNotifications(response.data);

        setFetching(false);
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
        setFetching(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, {
        withCredentials: true,
      });

      // Remove notification from the UI after successful deletion
      setNotifications(notifications.filter((n) => n.id !== id));
      console.log(`Notification with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(
        `Error deleting notification with ID ${id}:`,
        error.message
      );
    }
  };
  const handleFollowRequestAction = async (triggeredById, action) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/follow/manage-follow-request`,
        { triggeredById, action },
        { withCredentials: true }
      );

      // Persist notification type change in the backend
      const updatedNotifications = notifications.map((notification) => {
        if (notification.triggeredById === triggeredById) {
          return {
            ...notification,
            type: action === "accept" ? "follow" : "rejected",
          };
        }
        return notification;
      });

      // Update local state with the modified notifications
      setNotifications(updatedNotifications);

      // Display a toast to the user
      showToast({
        title:
          action === "accept"
            ? "Follow request accepted"
            : "Follow request rejected",
        description:
          response?.data?.message || "Action completed successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error(
        "Error managing follow request:",
        error.response?.data || error.message
      );

      showToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        duration: 3000,
      });
    }
  };

  // Handle loading states
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>You must be logged in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold flex items-center">
            <FaBell className="w-6 h-6 mr-2" />
            Notifications
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="bg-transparent border-none text-white hover:text-gray-200 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </header>
        {fetching ? (
          <div className="p-4 text-center text-gray-500">
            Fetching notifications...
          </div>
        ) : notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {notification.type === "follow" ? (
                      <FaUserPlus className="w-5 h-5 text-green-500" />
                    ) : notification.type === "like" ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : notification.type === "comment" ? (
                      <FaComment className="w-5 h-5 text-blue-500" />
                    ) : null}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {notification.type === "follow_request" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log(
                            "Button clicked for triggeredById:",
                            notification.triggeredById
                          );
                          handleFollowRequestAction(
                            notification.triggeredById,
                            "accept"
                          );
                        }}
                        className="px-4 py-2 rounded-md bg-[#9b87f5] text-white hover:bg-[#7E69AB] transition-colors duration-200 flex items-center space-x-1"
                      >
                        <FaCheck className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() =>
                          handleFollowRequestAction(
                            notification.triggeredById,
                            "reject"
                          )
                        }
                        className="px-4 py-2 rounded-md bg-[#D946EF] text-white hover:bg-[#be2ed6] transition-colors duration-200 flex items-center space-x-1"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="bg-transparent border-none text-gray-400 hover:text-gray-500 cursor-pointer"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
