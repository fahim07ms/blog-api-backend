const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient, Role } = require("../generated/prisma");
const prisma = new PrismaClient();

dotenv.config();

// Gets all posts (only admins can do this)
const getAllPosts = async (req, res) => {
    try {
        // Get all posts
        const posts = await prisma.post.findMany({
            orderBy: {

            }
        });

        res.status(200).json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error : "Internal server error" });
    }
};

// Get all published posts to show them to anyone
const getAllPublishedPosts = async (req, res) => {
    try {
        const publishedPosts = await prisma.post.findMany({
            where: {
                published: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ publishedPosts });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error : "Internal server error!" });
    }
};

// Get all posts of an author
const getAllPostsOfAuthor = async (req, res) => {
    try {
        const authorPosts = await prisma.post.findMany({
            where: {
                authorId: req.user.authorId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ authorPosts });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error : "Internal server error!" });
    }
};

// Create a post
const createPost = async (req, res) => {
    // Get submitted data
    const { title, content } = req.body;

    // Check if the title or content is empty or not
    if (!title) return res.status(403).json({ err : "Title is required!" });
    if (!content) return res.status(403).json({ err : "Empty post content!!!" });

    console.log(req.user);
    // Try to create the post
    try {
        // Create the post in db
        const post = await prisma.post.create({
            data: {
                title: title,
                content: content,
                authorId: req.user.authorId
            }
        });

        console.log(post);

        res.status(201).json({ msg : "Post creation successful!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error : "Internal server error" });
    }
};

module.exports = {
    getAllPosts,
    getAllPublishedPosts,
    getAllPostsOfAuthor,
    createPost
}