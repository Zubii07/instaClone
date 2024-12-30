const express = require("express");
const router = express.Router();
const {
  // followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  toggleFollowUser,
  getFollowersCount,
  isFollowing,
  manageFollowRequest,
  getFollowRequestStatus,
  getFollowingCount,
} = require("../controller/followController");
const authorizeUser = require("../middleware/authorizeUser");

router.post("/unfollow/:id", unfollowUser);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);
router.post("/toggle-follow/:id", toggleFollowUser);
router.post("/manage-follow-request", authorizeUser, manageFollowRequest);
router.get("/check-follow-status", getFollowRequestStatus);
router.get("/followers-count/:id", getFollowersCount);
router.get("/following-count/:id", getFollowingCount);
router.post("/is-following/:id", isFollowing);

module.exports = router;
