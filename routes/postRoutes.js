const express = require("express");
const router = express.Router();

// Todo: pagination for posts

// Access authMiddlewares
const { requireAdmin, requireAuthor, verifyToken } = require("../middlewares/authMiddlewares");

// Access post controllers
const { getAllPosts, getAllPublishedPosts, getAllPostsOfAuthor, createPost, editPost, deletePost } = require("../controllers/postControllers");

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

// Exporting the post route
module.exports = {
    postRoutes : router
}