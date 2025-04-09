const express = require('express');
const router = express.Router();

// Import authentication related controllers
const { verifyToken, registerUser, loginUser, logoutUser, updateUser, deleteUser, refreshToken } = require("../controllers/authControllers.js")


// User Register
router.post("/register", );

// User login
router.post("/login", );

// User logout
router.post("/logout", );

// User update
router.put("/update", );

// User Deletion
router.delete("/delete",);

// Refresh Token
router.refreshToken("/refresh-token", )



module.exports = {
    authRoutes: router
}