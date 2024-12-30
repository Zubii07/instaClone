const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controller/searchController");
const authorizeUser = require("../middleware/authorizeUser");

router.get("/search", authorizeUser, searchUsers);

module.exports = router;
