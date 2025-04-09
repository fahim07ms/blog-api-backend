const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient, Role } = require("../generated/prisma");
const prisma = new PrismaClient();

dotenv.config();

const generateAccessToken = (user) => {
    return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY });
};

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

// Author excess check middleware
const requireAuthor = (req, res, next) => {
    if (!req.user.authorId) {
        return res.status(403).json({ msg: 'Forbidden: Author access required' });
    }
    next();
};

// Register a user
const registerUser = async (req, res) => {
    // Get the body data
    const { name, username, email, pass, cpass } = req.body;

    // Check if user confirmed password correctly
    if (pass !== cpass) {
        return res.status(401).json({ error: "Password doesn't match" });
    }

    // Hash the password
    const hashedPass = await bcrypt.hash(pass, 10);

    // Try to register user 
    try {
        // Try finding if username or email is already taken or not
        const existingUsername = await prisma.user.findFirst({
            where: {
                username: username
            }
        });

        const existingEmail = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (existingUsername) return res.status(409).json({ error: "Username already taken!" });
        if (existingEmail) return res.status(409).json({ error: "Email already taken" });

        const user = await prisma.user.create({
            data: {
                name: name,
                username: username,
                email: email,
                password: hashedPass,
            }
        });

        return res.status(201).json({ msg: "User registered successfully! " });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server side error!" });
    }
};

// Login a user
const loginUser = async (req, res, next) => {
    // Get username and password
    const { username, pass } = req.body;

    // Find the user
    try {
        const user = prisma.user.findUnique({
            where: { username: username }
        });

        // No user with that username
        if (!user) return res.status(401).json({ error: "Username not found!" });

        // Compare provided password with the stored hashed password
        const passMatch = bcrypt.compare(pass, user.password);

        // Check password, if wrong pass then throw error
        if (!passMatch) return res.status(403).json({ error: "Invalid password" });

        // Generate access & refresh tokens
        const accessToken = generateAccessToken();
        const refreshToken = generateRefreshToken();

        // Store the refresh token in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: refreshToken }
        });

        // Send refresh token via HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: process.env.JWT_REFRESH_EXPIRY * 24 * 60 * 60 * 1000
        });

        // Send the access token
        res.status(201).json({ accessToken });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server side error!" });
    }
}

// Logout a user
const logoutUser = async (req, res, next) => {
    // Get the refresh token
    const refreshToken = req.cookie.refreshToken;

    // If there is a token then clear that token from the DB
    try {
        if (refreshToken) {
            // Get payload
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Update DB
            await prisma.user.update({
                where: { id: payload.userId },
                data: { refreshToken: null }
            });

            // Clear the token
            res.clearCookie("refreshToken");
            res.status(201).json({ msg: "Logout successful!" });
        }
    } catch (err) {
        console.error(err);
        return res.status(401).json({ err: "Refresh token invalid/already expired!" });
    }
};

// Exports
module.exports = {
    verifyToken,
    requireAuthor,
    registerUser,
    loginUser
}