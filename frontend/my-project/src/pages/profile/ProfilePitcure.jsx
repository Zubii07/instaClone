import { useState, useRef } from "react";
import axios from "axios";
import { Pencil, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import dotenv from "dotenv";
dotenv.config();

const EditableProfilePicture = ({
  currentImage,
  username,
  id,
  onProfileUpdate,
  isLoggedInUser,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  dotenv.config();

  const handleImageClick = () => {
    if (isLoggedInUser) fileInputRef.current?.click();
  };

  const handleDeletePicture = async (e) => {
    e.stopPropagation(); // Prevent triggering the image upload click

    if (!currentImage) {
      showToast({
        variant: "destructive",
        title: "No picture to delete",
        description: "You don't have a profile picture to delete",
      });
      return;
    }

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${API_BASE_URL}/api/upload/delete-profile-picture/${id}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        showToast({
          variant: "success",
          title: "Picture deleted",
          description: "Profile picture deleted successfully",
        });
        onProfileUpdate(null);
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      showToast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete profile picture",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image under 10MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        showToast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file",
        });
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("picture", file);

        const response = await axios.post(
          `${API_BASE_URL}/api/upload/profile-picture/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          showToast({
            variant: "success",
            title: "Profile updated",
            description: "Profile picture updated successfully",
          });
          onProfileUpdate(response.data.user.picture);
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        showToast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload profile picture",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => isLoggedInUser && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="cursor-pointer relative group" onClick={handleImageClick}>
        <img
          src={currentImage || "https://via.placeholder.com/150"}
          alt={`${username}'s profile picture`}
          className="rounded-full h-20 w-20 object-cover"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
            <span className="text-white">Uploading...</span>
          </div>
        )}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
            <span className="text-white">Deleting...</span>
          </div>
        )}
        {isLoggedInUser && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity duration-200">
            <div className="flex gap-2">
              <Pencil className="w-6 h-6 text-white" />
              {currentImage && (
                <button
                  onClick={handleDeletePicture}
                  className="p-1 rounded-full hover:bg-red-500/50 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {isLoggedInUser && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      )}
    </div>
  );
};

export default EditableProfilePicture;
