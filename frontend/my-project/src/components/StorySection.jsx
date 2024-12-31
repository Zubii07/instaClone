import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AiOutlinePlus, AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import { BiLoaderAlt } from "react-icons/bi";
import styles from "../style/Story.module.css";
import { useAuth } from "../hooks/useAuth";

const STORY_DURATION = 5000;

const StorySection = () => {
  const [storiesByUser, setStoriesByUser] = useState({});
  const [currentStory, setCurrentStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserStories, setCurrentUserStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadingStory, setUploadingStory] = useState(false);
  const { user } = useAuth();

  // Fetch and group stories by user
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/stories", {
        withCredentials: true,
      });
      const storiesData = response.data.stories || [];

      // Group stories by user
      const groupedStories = storiesData.reduce((acc, story) => {
        const userId = story.user.id;
        if (!acc[userId]) {
          acc[userId] = { user: story.user, stories: [] };
        }
        acc[userId].stories.push(story);
        return acc;
      }, {});

      setStoriesByUser(groupedStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();

    // Set interval to refresh stories every minute
    const intervalId = setInterval(() => {
      fetchStories();
    }, 60000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  // Handle story upload
  const handleUpload = async () => {
    if (uploadingStory) return;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/*";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("story", file);

      try {
        setUploadingStory(true);
        await axios.post("http://localhost:5000/api/stories/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        await fetchStories(); // Refresh stories after upload
      } catch (error) {
        console.error("Error uploading story:", error);
      } finally {
        setUploadingStory(false);
      }
    };

    fileInput.click();
  };

  // Story viewing logic
  const openStory = (userStories, index) => {
    setCurrentUserStories(userStories);
    setCurrentStory(userStories[index]);
    setCurrentStoryIndex(index);
    setProgress(0);
  };

  const deleteStory = async (storyId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/stories/delete/${storyId}`,
        {
          withCredentials: true,
        }
      );
      await fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  // Progress
  useEffect(() => {
    if (!currentStory) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to the next story in the sequence
          if (currentStoryIndex < currentUserStories.length - 1) {
            openStory(currentUserStories, currentStoryIndex + 1);
          } else {
            setCurrentStory(null); // Close modal if it's the last story
          }
          return 0;
        }
        return prev + (100 / STORY_DURATION) * 100;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentStory, currentStoryIndex, currentUserStories]);

  return (
    <section className="story-section py-4">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Stories</h2>
        <div
          className={`${styles.storyContainer} flex space-x-4 overflow-x-auto pb-2`}
        >
          {/* Add Story Button */}
          <div
            className={`${styles.storyItem} flex-shrink-0 flex flex-col items-center`}
            onClick={handleUpload}
            style={{ cursor: uploadingStory ? "not-allowed" : "pointer" }}
          >
            <div className="relative">
              <div className="story-image bg-gray-300 p-1 rounded-full flex items-center justify-center w-16 h-16">
                {uploadingStory ? (
                  <BiLoaderAlt
                    className={`text-gray-700 text-2xl ${styles.loadingSpinner}`}
                  />
                ) : (
                  <AiOutlinePlus className="text-gray-700 text-2xl" />
                )}
              </div>
            </div>
            <p className="text-sm text-center mt-2">
              {uploadingStory ? "Uploading..." : "Add Story"}
            </p>
          </div>

          {/* Stories by User */}
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <BiLoaderAlt
                className={`text-gray-700 text-2xl ${styles.loadingSpinner}`}
              />
            </div>
          ) : (
            Object.values(storiesByUser).map((userGroup) => (
              <div
                key={userGroup.user.id}
                className={`${styles.storyItem} flex-shrink-0 flex flex-col items-center cursor-pointer`}
                onClick={() => openStory(userGroup.stories, 0)}
              >
                <div
                  className={`relative story-image p-1 rounded-full ${
                    userGroup.stories.some((s) => !s.viewedByUser)
                      ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                      : "bg-gray-300"
                  }`}
                >
                  <img
                    src={userGroup.stories[0].contentUrl}
                    alt="user story"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <p className="text-sm text-center mt-2">
                  {userGroup.user.username || `User ${userGroup.user.id}`}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Story Modal */}
      {currentStory && (
        <div
          className={`${styles.storyModal} fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50`}
          onClick={() => setCurrentStory(null)}
        >
          {/* Progress Bar */}
          <div className={styles.storyProgress}>
            <div
              className={styles.storyProgressBar}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className="relative max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white text-xl z-20"
              onClick={() => setCurrentStory(null)}
            >
              <AiOutlineClose />
            </button>

            {user && user.id === currentStory.user.id && (
              <button
                className="absolute top-4 left-4 text-white text-xl z-20"
                onClick={() => {
                  deleteStory(currentStory.id);
                  setCurrentStory(null);
                }}
              >
                <AiOutlineDelete />
              </button>
            )}

            {currentStory.contentType === "image" ? (
              <img
                src={currentStory.contentUrl}
                alt="story"
                className="w-full rounded-lg"
              />
            ) : (
              <video
                src={currentStory.contentUrl}
                controls
                autoPlay
                className="w-full rounded-lg"
                onEnded={() =>
                  currentStoryIndex < currentUserStories.length - 1
                    ? openStory(currentUserStories, currentStoryIndex + 1)
                    : setCurrentStory(null)
                }
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default StorySection;
