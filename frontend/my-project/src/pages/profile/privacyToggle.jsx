import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../hooks/useToast";
import { FaLock, FaUnlock } from "react-icons/fa";

const PrivacyToggle = ({
  initialPrivacy = false,
  onPrivacyChange,
  className = "",
}) => {
  const [isPrivate, setIsPrivate] = useState(initialPrivacy);
  const { showToast } = useToast();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    setIsPrivate(initialPrivacy);
  }, [initialPrivacy]);

  const togglePrivacy = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/users/toggle-privacy`,
        {},
        { withCredentials: true }
      );

      setIsPrivate(response.data.isPrivate);
      onPrivacyChange?.(response.data.isPrivate);

      showToast({
        title: "Privacy Updated",
        description: `Your account is now ${
          response.data.isPrivate ? "private" : "public"
        }`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error toggling privacy:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={togglePrivacy}
      className={`flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors duration-200 ${className}`}
      title={isPrivate ? "Set Public" : "Set Private"}
    >
      {isPrivate ? (
        <FaLock className="h-4 w-4 text-gray-600" />
      ) : (
        <FaUnlock className="h-4 w-4 text-gray-600" />
      )}
    </button>
  );
};

export default PrivacyToggle;
