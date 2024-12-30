const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Register (Signup) a new user
exports.registerUser = async (req, res) => {
  console.log("in register controller");

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      picture: null,
    });

    const token = generateToken(newUser);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
      secure: false,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Authenticate (Login) user with email and password
exports.authenticateUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password match:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
      secure: false,
    });

    res.status(200).json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error during authentication:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  try {
    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//profile
exports.getUserProfile = async (req, res) => {
  try {
    const token = req.cookies?.token; // Get the token from the cookie
    if (!token) {
      console.log("Token from cookies:", req.cookies.token);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    console.log("Decoded token:", decoded);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] }, // Exclude sensitive data
    });

    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get a user
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] }, // Exclude sensitive data
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Toggle privacy setting
exports.togglePrivacy = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user's ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isPrivate = !user.isPrivate; // Toggle privacy
    await user.save();

    res.json({ message: "Privacy setting updated", isPrivate: user.isPrivate });
  } catch (error) {
    console.error("Error updating privacy setting:", error);
    res.status(500).json({ error: "Server error" });
  }
};
