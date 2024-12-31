import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import axios from "axios";
import { CreatePostModal } from "./CreatePostModel";
import PrivacyToggle from "../pages/profile/privacyToggle";
import Search from "./Search";
import {
  FaHome,
  FaPlusSquare,
  FaHeart,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial privacy status
    const fetchPrivacyStatus = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${user.id}`,
          { withCredentials: true }
        );
        setIsPrivate(response.data.user.isPrivate);
      } catch (error) {
        console.error("Error fetching privacy status:", error);
      }
    };

    fetchPrivacyStatus();
  }, [user]);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/notifications/${user.id}`,
          { withCredentials: true }
        );
        const unread = response.data.some(
          (notification) => !notification.isRead
        );
        setHasUnread(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    };

    fetchNotifications();
  }, [user]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        title: "Logged out successfully",
        description: "See you soon!",
        duration: 3000,
      });
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      showToast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        duration: 2000,
      });
    }
  };

  // Handle Notification Click
  const handleNotificationClick = async () => {
    if (!user) return;

    try {
      await axios.put(
        `http://localhost:5000/api/notifications/mark-as-read/${user.id}`,
        {},
        { withCredentials: true }
      );
      setHasUnread(false);
      navigate("/notifications");
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 transition-transform duration-200 hover:scale-105">
            <Link to="/">
              <img
                className="h-8"
                src="/assets/instagram.png"
                alt="Instagram Logo"
              />
            </Link>
          </div>

          <div className="sm:hidden flex items-center ml-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>

          <div className="hidden sm:flex justify-center pt-2 sm:pt-0 flex-1 max-w-md mx-4">
            <Search />
          </div>

          <div className="hidden sm:flex items-center space-x-6">
            <button
              className="nav-icon-link"
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              <FaPlusSquare className="h-6 w-6 text-gray-800 transition-colors duration-200 hover:text-gray-600" />
            </button>
            <button
              onClick={handleNotificationClick}
              className="relative nav-icon-link"
            >
              <FaHeart className="h-6 w-6 text-gray-800 transition-colors duration-200 hover:text-gray-600" />
              {hasUnread && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-red-500 rounded-full"></span>
              )}
            </button>
            <Link to="/profile">
              <img
                className="h-8 w-8 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 border-2 border-transparent hover:border-blue-500"
                src="/assets/avatar.png"
                alt="Profile"
              />
            </Link>

            {user && (
              <PrivacyToggle
                initialPrivacy={isPrivate}
                onPrivacyChange={setIsPrivate}
              />
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 hover:shadow-lg"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } sm:hidden bg-white p-4 rounded-md shadow-lg absolute left-0 right-0 transition-all duration-200 ease-in-out`}
        >
          {user && (
            <PrivacyToggle
              initialPrivacy={isPrivate}
              onPrivacyChange={(newPrivacy) => {
                setIsPrivate(newPrivacy);
                setIsMenuOpen(false); // Close the menu after toggling
              }}
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
            />
          )}
          <Link
            to="/profile"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <FaHome className="inline-block mr-2 h-5 w-5" />
            Profile
          </Link>
          <button
            onClick={() => {
              setIsCreatePostModalOpen(true);
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <FaPlusSquare className="inline-block mr-2 h-5 w-5" />
            Create
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <FaHeart className="inline-block mr-2 h-5 w-5" />
            Notifications
          </button>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
