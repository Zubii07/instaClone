import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const Like = ({ postId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/likes/${postId}/likes`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching like status: ${response.status}`);
        }
        const { likes, likedByUser } = await response.json();
        setIsLiked(likedByUser);
        setLikes(likes.length);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    fetchLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    try {
      const endpoint = isLiked
        ? `${API_BASE_URL}/api/likes/${postId}/unlike`
        : `${API_BASE_URL}/api/likes/${postId}/like`;

      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  return (
    <div>
      <button onClick={handleLike} className="focus:outline-none">
        <Heart
          className={`w-7 h-7 transition-colors duration-200 ${
            isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-700"
          }`}
        />
      </button>
      <span className="font-semibold">{likes.toLocaleString()} likes</span>
    </div>
  );
};

export default Like;
