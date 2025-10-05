// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const designRoutes = require("./routes/designRoutes");

dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json({ limit: "50mb" })); // Allow large JSON payloads (for image base64)
app.use(express.urlencoded({ limit: "50mb", extended: true })); // For URL-encoded data

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/designs", designRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
