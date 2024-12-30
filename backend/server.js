const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");
const userRoutes = require("./routes/userRoutes");
const storyRoutes = require("./routes/storyRoutes");
const followRoutes = require("./routes/followRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const searchRoutes = require("./routes/searchRoutes");
const PictureRoutes = require("./routes/PictureRoutes");
const path = require("path");
const multer = require("multer");
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api", searchRoutes);
app.use("/api/upload", PictureRoutes);

const PORT = process.env.PORT || 5000;

const sequelize = new Sequelize(
  process.env.DB_NAME || "clone",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "zohaib",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

sequelize.sync({ force: false }).then(() => {
  console.log("Models synchronized with the database.");
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
