// backend/models/Design.js
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const DesignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  title_en: String,
  title_jp: String,
  description: {
    type: String,
    required: true,
  },
  description_en: String,
  description_jp: String,
  author: {
    type: String,
    required: true,
  },
  authorId: {
    // To link designs to specific users
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [CommentSchema],
  image: {
    type: String, // URL or base64 string
    required: true,
  },
  hashtags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Design", DesignSchema);
