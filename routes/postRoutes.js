const express = require("express");
const router = express.Router();

// Todo: pagination for posts

// Access authMiddlewares
const {
    requireAdmin,
    requireAuthor,
    verifyToken,
} = require("../middlewares/authMiddlewares");

// Access post controllers
const {
    getAllPosts,
    getAllPublishedPosts,
    getAllPostsOfAuthor,
    createPost,
    editPost,
    deletePost,
    getPostComments,
    createComment,
    deleteComment,
} = require("../controllers/postControllers");

// Get all published posts
router.get("/", getAllPublishedPosts);

// Get all posts (only admins can see)
router.get("/all", verifyToken, requireAdmin, getAllPosts);

// Get all posts of an author
router.get("/authorPost", verifyToken, requireAuthor, getAllPostsOfAuthor);

// Create a post
router.post("/create", verifyToken, requireAuthor, createPost);

// Edit a post
router.put("/:id/edit", verifyToken, requireAuthor, editPost);

// Delete a post
router.delete("/:id/delete", verifyToken, requireAuthor, deletePost);

// Get post comments
router.get("/:id/comments", getPostComments);

// Create post comments
router.post("/:id/comments/create", verifyToken, createComment);

// Delete a comment
router.delete("/:id/comments/:commentId/delete", verifyToken, deleteComment);

// Exporting the post route
module.exports = {
    postRoutes: router,
};
