// backend/controllers/designController.js
const Design = require("../models/Design");
const User = require("../models/User"); // To get user name for author field

// @desc    Get all designs
// @route   GET /api/designs
// @access  Public
const getDesigns = async (req, res) => {
  const designs = await Design.find({});
  res.json(designs);
};

// @desc    Get a single design by ID
// @route   GET /api/designs/:id
// @access  Public
const getDesignById = async (req, res) => {
  const design = await Design.findById(req.params.id);
  if (design) {
    res.json(design);
  } else {
    res.status(404).json({ message: "Design not found" });
  }
};

// @desc    Upload a new design
// @route   POST /api/designs
// @access  Private
const uploadDesign = async (req, res) => {
  const { title, description, image, hashtags } = req.body;

  if (!title || !description || !image) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  const user = await User.findById(req.user.id); // req.user is set by auth middleware

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const newDesign = new Design({
    title,
    description,
    image,
    author: user.name, // Use the logged-in user's name
    authorId: user._id,
    hashtags: hashtags || [],
  });

  const createdDesign = await newDesign.save();
  res.status(201).json(createdDesign);
};

// @desc    Update a design (e.g., likes, comments)
// @route   PUT /api/designs/:id
// @access  Private (or Public for likes/comments, depending on logic)
const updateDesign = async (req, res) => {
  const { title, description, image, likes, comments, hashtags } = req.body;

  const design = await Design.findById(req.params.id);

  if (design) {
    // Only allow author to update title, description, image, hashtags
    if (design.authorId.toString() === req.user.id.toString()) {
      design.title = title || design.title;
      design.description = description || design.description;
      design.image = image || design.image;
      design.hashtags = hashtags || design.hashtags;
    } else {
      // Allow anyone to update likes/comments (or specific logic)
      if (likes !== undefined) design.likes = likes;
      if (comments !== undefined) design.comments = comments;
    }

    const updatedDesign = await design.save();
    res.json(updatedDesign);
  } else {
    res.status(404).json({ message: "Design not found" });
  }
};

// @desc    Delete a design
// @route   DELETE /api/designs/:id
// @access  Private (only author can delete)
const deleteDesign = async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (design) {
    if (design.authorId.toString() !== req.user.id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this design" });
    }
    await design.deleteOne(); // Use deleteOne() for Mongoose 6+
    res.json({ message: "Design removed" });
  } else {
    res.status(404).json({ message: "Design not found" });
  }
};

// @desc    Add a comment to a design
// @route   POST /api/designs/:id/comments
// @access  Private
const addComment = async (req, res) => {
  const { text } = req.body;
  const design = await Design.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!design) {
    return res.status(404).json({ message: "Design not found" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!text) {
    return res.status(400).json({ message: "Comment text cannot be empty" });
  }

  const newComment = {
    author: user.name,
    text,
    timestamp: new Date(),
  };

  design.comments.push(newComment);
  await design.save();
  res.status(201).json(design.comments[design.comments.length - 1]); // Return the new comment
};

// @desc    Update a comment on a design
// @route   PUT /api/designs/:designId/comments/:commentId
// @access  Private (only author can edit)
const updateComment = async (req, res) => {
  const { text } = req.body;
  const { designId, commentId } = req.params;

  const design = await Design.findById(designId);
  if (!design) {
    return res.status(404).json({ message: "Design not found" });
  }

  const comment = design.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const user = await User.findById(req.user.id);
  if (!user || comment.author !== user.name) {
    // Assuming author name is unique enough or add authorId to comment schema
    return res
      .status(401)
      .json({ message: "Not authorized to edit this comment" });
  }

  // Optional: Check time limit for editing
  const commentTime = new Date(comment.timestamp);
  const currentTime = new Date();
  const timeDiffMinutes = (currentTime - commentTime) / (1000 * 60);
  if (timeDiffMinutes > 5) {
    // 5 minutes edit window
    return res
      .status(403)
      .json({ message: "Cannot edit comment after 5 minutes" });
  }

  comment.text = text;
  await design.save();
  res.json(comment);
};

// @desc    Delete a comment from a design
// @route   DELETE /api/designs/:designId/comments/:commentId
// @access  Private (only author can delete)
const deleteComment = async (req, res) => {
  const { designId, commentId } = req.params;

  const design = await Design.findById(designId);
  if (!design) {
    return res.status(404).json({ message: "Design not found" });
  }

  const comment = design.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const user = await User.findById(req.user.id);
  if (!user || comment.author !== user.name) {
    // Assuming author name is unique enough or add authorId to comment schema
    return res
      .status(401)
      .json({ message: "Not authorized to delete this comment" });
  }

  design.comments.pull(commentId); // Remove comment by its ID
  await design.save();
  res.json({ message: "Comment removed" });
};

module.exports = {
  getDesigns,
  getDesignById,
  uploadDesign,
  updateDesign,
  deleteDesign,
  addComment,
  updateComment,
  deleteComment,
};
