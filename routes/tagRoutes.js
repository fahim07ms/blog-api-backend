const express = require("express");
const router = express.Router();

const {
    getAllTags,
    createTag,
    getTagPosts,
} = require("../controllers/tagControllers");
const {
    verifyToken,
    requireAuthor,
} = require("../middlewares/authMiddlewares");

// Get all tags
router.get("/", getAllTags);

// Create a tag
router.post("/create", verifyToken, requireAuthor, createTag);

// Get all published posts of a tag
router.get("/:tagName/posts", getTagPosts);

module.exports = {
    tagRoutes: router,
};
