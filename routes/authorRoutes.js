const express = require("express");
const router = express.Router();

// Get author controllers
const { getAuthorProfile, createAuthorProfile } = require("../controllers/authorControllers");

// Middlewares
const { verifyToken, requireAuthor } = require("../middlewares/authMiddlewares");

// Show author profile
router.get("/profile", verifyToken, requireAuthor, getAuthorProfile);

// Create author profile
router.post("/create", verifyToken, createAuthorProfile);


module.exports = {
    authorRoutes: router
}