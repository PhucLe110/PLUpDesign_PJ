// backend/routes/designRoutes.js
const express = require("express");
const {
  getDesigns,
  getDesignById,
  uploadDesign,
  updateDesign,
  deleteDesign,
  addComment,
  updateComment,
  deleteComment,
} = require("../controllers/designController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").get(getDesigns).post(protect, uploadDesign); // Protect upload route

router
  .route("/:id")
  .get(getDesignById)
  .put(protect, updateDesign) // Protect update route
  .delete(protect, deleteDesign); // Protect delete route

router.route("/:id/comments").post(protect, addComment); // Protect add comment route

router
  .route("/:designId/comments/:commentId")
  .put(protect, updateComment) // Protect update comment route
  .delete(protect, deleteComment); // Protect delete comment route

module.exports = router;
