const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient, Role } = require("../generated/prisma");
const prisma = new PrismaClient();

dotenv.config();

// Get author profile
const getAuthorProfile = async (req, res) => {
    try {
        const author = await prisma.author.findUnique({
            where: { id: req.user.authorId },
            include: { 
                user: {
                    omit: {
                        refreshToken: true,
                        password: true,
                    },
                    include: {
                        profile: true
                    }
                }
            }
        });

        res.status(200).json({ author });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error : "Internal server error" });
    }
};

// Controller for creating author profile
const createAuthorProfile = async (req, res) => {
    // Check if the requester has an author role or not
    if (req.user.role !== Role.AUTHOR) {
        return res.status(403).json({ error: 'Forbidden: Author access required' });
    }

    // Get submitted data
    const { bio, website } = req.body;

    try {

        const existingAuthor = await prisma.author.findUnique({
            where: { userId : req.user.id }
        });

        if (existingAuthor) return res.status(409).json({ error : "Author profile already exists." });

        const author = await prisma.author.create({
            data: {
                bio: bio || null,
                website: website || null,
                user: {
                    connect: { id: req.user.id }
                }
            }
        });

        res.status(201).json({ msg : "Author profile successfully created!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error : "Internal server error" });
    }
};



module.exports = {
    getAuthorProfile,
    createAuthorProfile
}