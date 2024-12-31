import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

export const CommentSection = ({ postId, loggedInUserId, postAuthorId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comments/${postId}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (postId) fetchComments();
  }, [postId, refresh]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    try {
      const response = await fetch("${API_BASE_URL}/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ postId, content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        setRefresh((prev) => !prev);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (response.ok) {
        setEditingCommentId(null);
        setRefresh((prev) => !prev);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}s/api/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setRefresh((prev) => !prev);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const CommentActions = ({ comment }) => {
    const canEdit = loggedInUserId === comment.user.id;
    const canDelete = loggedInUserId === postAuthorId;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() =>
            setOpenDropdownId(openDropdownId === comment.id ? null : comment.id)
          }
          className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
        {openDropdownId === comment.id && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            {canEdit && (
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditedContent(comment.content);
                  setOpenDropdownId(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  handleDeleteComment(comment.id);
                  setOpenDropdownId(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200">
      <div className="p-4 space-y-4">
        {(showAll ? comments : comments.slice(0, 3)).map((comment) => (
          <div key={comment.id} className="flex justify-between items-start">
            <div className="flex space-x-2 flex-grow">
              <span className="font-semibold">{comment.user.username}</span>
              {editingCommentId === comment.id ? (
                <div className="flex items-center space-x-2 flex-grow">
                  <input
                    type="text"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="flex-grow px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span>{comment.content}</span>
              )}
            </div>
            <CommentActions comment={comment} />
          </div>
        ))}
        {!showAll && comments.length > 3 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-blue-500 hover:underline"
          >
            See More...
          </button>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
