import React, { useState, useEffect } from "react";
import axios from "axios";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { CommentSection } from "../components/CommentSection";
import Like from "../components/LikeSection";
import dotenv from "dotenv";
dotenv.config();

const Post = ({
  postId,
  profilePicture,
  content,
  title,
  imageUrl,
  username,
  initialLikes = 0,
  loggedInUserId,
}) => {
  const { user } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleEdit = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/posts/${postId}/edit`,
        {
          title: editedTitle,
          content: editedContent,
          userId: user.id,
        },
        { withCredentials: true }
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${postId}/delete`, {
        data: { userId: user.id },
        withCredentials: true,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md my-4">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`${username}'s profile`}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-semibold">
                  {username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="ml-3 font-semibold">{username}</span>
          </div>
        </div>

        {user?.id === loggedInUserId && (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setEditMode(true);
                    setDropdownVisible(false);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-500"
                  onClick={handleDelete}
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Image */}
      {imageUrl && (
        <div className="relative">
          <img src={imageUrl} alt="Post content" className="w-full h-auto" />
        </div>
      )}

      {/* Post Content */}
      {!editMode ? (
        <div className="px-4 py-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-700">{content}</p>
        </div>
      ) : (
        <div className="p-4">
          <input
            className="border p-2 w-full mb-2 rounded"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <textarea
            className="border p-2 w-full mb-2 rounded"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pb-2">
        <Like postId={postId} initialLikes={initialLikes} />
      </div>

      <CommentSection postId={postId} />
    </div>
  );
};

export { Post };

const PostSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched posts:", data); // Log for debugging
        setPosts(Array.isArray(data) ? data : [data]); // Ensure data is an array
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading posts...</div>;

  return (
    <div>
      {posts.map((post) => (
        <Post
          key={post.id}
          postId={post.id}
          username={post.user?.username || "Unknown"}
          imageUrl={post.images?.[0]?.imageUrl || ""}
          title={post.title}
          content={post.content}
          initialLikes={post.likes || 0}
          loggedInUserId={post.userId}
          profilePicture={post.user?.picture || ""}
        />
      ))}
    </div>
  );
};

export default PostSection;
