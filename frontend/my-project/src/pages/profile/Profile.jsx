import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { useParams } from "react-router-dom";
import PrivateAccountMessage from "./PrivateAccountMessage";
import EditableProfilePicture from "./ProfilePitcure";

const Profile = () => {
  const { user, setUser } = useAuth();
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    image: "",
    posts: 0,
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFollowRequestPending, setIsFollowRequestPending] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchUserPosts = async () => {
    try {
      const endpoint = id
        ? `${API_BASE_URL}/api/posts/user/${id}`
        : `${API_BASE_URL}/api/posts/user/${user.id}`;
      const response = await axios.get(endpoint, { withCredentials: true });
      setPosts(response.data);
      // Update the posts count in profile state when posts are fetched
      setProfile((prev) => ({
        ...prev,
        posts: response.data.length,
      }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user, id]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = id ? `/api/users/${id}` : `/api/users/profile`;
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          withCredentials: true,
        });
        const profileData = response.data.user;
        // Fetch followers and following counts
        const [followersRes, followingRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/follow/followers-count/${id || user.id}`,
            { withCredentials: true }
          ),
          axios.get(
            `${API_BASE_URL}/api/follow/following-count/${id || user.id}`,
            { withCredentials: true }
          ),
        ]);
        setProfile({
          id: profileData.id || "",
          username: profileData.username || "",
          image: profileData.picture || "",
          followers: followersRes.data.followers || 0,
          following: followingRes.data.following || 0,
        });
        setIsPrivate(profileData.isPrivate);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      }
    };

    const checkFollowingStatus = async () => {
      try {
        const followerId = user.id;
        const followingId = id || user.id;
        if (followerId === followingId) {
          setIsFollowing(false);
          return;
        }
        const response = await axios.post(
          `${API_BASE_URL}/api/follow/is-following/${followingId}`,
          { followerId, followingId },
          { withCredentials: true }
        );
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error.message);
      }
    };
    const fetchFollowRequestStatus = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/follow/check-follow-status`,
          {
            params: { followerId: user.id, followingId: id || user.id },
            withCredentials: true,
          }
        );
        setIsFollowRequestPending(response.data.status === "pending");
        setIsFollowing(response.data.status === "accepted");
      } catch (error) {
        console.error("Error fetching follow request status:", error.message);
      }
    };
    if (user) {
      fetchProfile();

      if (id) {
        checkFollowingStatus();
        fetchFollowRequestStatus();
      }
    }
  }, [id, user.id, user]);

  const handleFollow = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/follow/toggle-follow/${profile.id}`,
        { userId: user.id },
        { withCredentials: true }
      );
      if (response.data.requestPending) {
        setIsFollowRequestPending(true);
      } else {
        setIsFollowing(response.data.following);
        setProfile((prev) => ({
          ...prev,
          followers: response.data.followersCount || prev.followers,
        }));
        setUser((prev) => ({
          ...prev,
          following: response.data.followingCount || prev.following,
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error.message);
    }
  };

  const isOwnProfile = user.id === profile.id;
  const shouldShowPrivateMessage = !isOwnProfile && isPrivate && !isFollowing;

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <EditableProfilePicture
            currentImage={profile.image || "https://via.placeholder.com/150"}
            username={profile.username || "N/A"}
            id={profile.id}
            isLoggedInUser={user.id === profile.id}
            onProfileUpdate={(newImage) => {
              console.log("New image:", newImage);

              setProfile((prev) => ({ ...prev, image: newImage }));
            }}
          />
          <div>
            <h1 className="font-bold text-lg">{profile.username || "N/A"}</h1>
          </div>
        </div>
        {!isOwnProfile && (
          <button
            onClick={handleFollow}
            className={`px-4 py-2 rounded-full transition-colors duration-200 text-white ${
              isFollowRequestPending
                ? "bg-gray-400 cursor-not-allowed"
                : isFollowing
                ? "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isFollowRequestPending}
          >
            {isFollowRequestPending
              ? "Request Pending"
              : isFollowing
              ? "Following"
              : "Follow"}
          </button>
        )}
      </div>

      {shouldShowPrivateMessage ? (
        <PrivateAccountMessage
          onFollowRequest={handleFollow}
          isFollowRequestPending={isFollowRequestPending}
        />
      ) : (
        <>
          <div className="flex justify-between my-4">
            <div className="text-center">
              <p className="font-bold text-lg">{posts.length || 0}</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{profile.followers || 0}</p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{profile.following || 0}</p>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {posts.map((post) => (
              <div key={post.id}>
                <img
                  src={
                    post.images?.[0]?.imageUrl ||
                    "https://via.placeholder.com/150"
                  }
                  alt={post.title}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
