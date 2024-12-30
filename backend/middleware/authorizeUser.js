const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authorizeUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log("Token from cookies:", token);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Attach the user object to the request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in authorizeUser middleware:", error.message);
    res
      .status(401)
      .json({ message: "Unauthorized. Invalid or expired token." });
  }
};

module.exports = authorizeUser;
