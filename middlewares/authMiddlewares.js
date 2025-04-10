const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient, Role } = require("../generated/prisma");
const prisma = new PrismaClient();

dotenv.config();

// Middleware for token verification
const verifyToken = async (req, res, next) => {
    // Get token
    const token = req.headers['authorization']?.split(' ')[1];

    // If there is no token then return error
    if (!token) {
        return res.status(401).json({ "error": "Access denied. Token missing!" });
    }

    // Decode JWT Token
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Get the user from the database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                role: true,
                authorProfile: {
                    select: {
                        id: true
                    }
                }
            }
        });

        // If no such user, then return error
        if (!user) {
            return res.status(401).json({ "msg": "User not found!" });
        }

        // Add user info to request object
        req.user = {
            id: user.id,
            role: user.role,
            authorId: user.authorProfile?.id
        }

        next();
    } catch (err) {
        // If the error is an Token Expiry error
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                msg: "Token expired"
            })
        }

        return res.status(401).json({ msg: 'Invalid token' });
    }
};

// Author access check middleware
const requireAuthor = (req, res, next) => {
    if (req.user.role !== Role.AUTHOR) {
        return res.status(403).json({ error: 'Forbidden: Author access required' });
    }

    if (!req.user.authorId) {
        return res.status(401).json({ error : "Seems like you have author role, but don't have an author profile. To create one use '{{base_url}}/api/authors/create'." });
    }

    next();
};

// Admin access check middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== Role.ADMIN) {
        return res.status(403).json({ error : "Only admins have access to this!" });
    }

    next();
};

module.exports = {
    verifyToken,
    requireAuthor,
    requireAdmin
}