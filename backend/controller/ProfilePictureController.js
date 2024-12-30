const cloudinary = require("cloudinary").v2;
const { User } = require("../models");

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile-pictures",
        width: 150,
        height: 150,
        crop: "fill",
      });
      user.picture = uploadedImage.secure_url;
      await user.save();
      return res
        .status(200)
        .json({ message: "Profile picture uploaded successfully", user });
    }
    return res.status(400).json({ error: "Please upload a file" });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the logged-in user is deleting their own picture
    if (req.user.id === id) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.picture) {
      return res.status(400).json({ error: "No profile picture to delete" });
    }

    // Extract public_id from Cloudinary URL
    const publicId = user.picture.split("/").pop().split(".")[0];
    const folder = "profile-pictures";
    const fullPublicId = `${folder}/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);

    // Remove the picture from the user's record
    user.picture = null;
    await user.save();

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
};
