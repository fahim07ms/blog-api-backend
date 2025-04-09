const express = require('express');
const router = express.Router();

// Import authentication related controllers
const { verifyToken, registerUser, loginUser, logoutUser, refreshAccessToken, getAllUsers, deleteUser, updateUser, getUserData } = require("../controllers/authControllers.js")


// User Register
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// User logout
router.post("/logout", verifyToken, logoutUser);

// User update
router.put("/update", verifyToken, updateUser);

// User Deletion
router.delete("/delete", verifyToken, deleteUser);

// Refresh Token
router.post("/refresh-token", verifyToken, refreshAccessToken);

// Get all users
router.get("/", verifyToken, getAllUsers);

// Get user data
router.get("/profile", verifyToken, getUserData);

module.exports = {
    authRoutes: router
}