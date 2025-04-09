const express = require('express');
const router = express.Router();

// Import authentication related controllers
const { verifyToken, registerUser } = require("../controllers/authControllers.js")


// User Register
router.post("/register", registerUser);

// // User login
// router.post("/login", loginUser);

// // User logout
// router.post("/logout", verifyToken, logoutUser);

// // User update
// router.put("/update", verifyToken, logoutUser);

// // User Deletion
// router.delete("/delete", verifyToken, deleteUser);

// // Refresh Token
// router.refreshToken("/refresh-token", verifyToken, refreshToken)



module.exports = {
    authRoutes: router
}