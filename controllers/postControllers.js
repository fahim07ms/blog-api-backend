const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient, Role, Prisma } = require("../generated/prisma");
const { updateUser } = require("./authControllers");
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

// Edit a post
const editPost = async (req, res) => {
    // Get submitted data
    const { title, content, published } = req.body;
    try {
        // Try to edit
        const updatedPost = await prisma.post.update({
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(published && { published })
            },
            where: { id : req.params.id }
        });

        res.status(201).json({ updatedPost });
    } catch (err) {
        console.error(err);
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2025') return res.status(404).json({ error : "Post with given id not found!" });
        }

        return res.status(500).json({ error : "Internal server error" });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        await prisma.post.delete({
            where: { id : req.params.id }
        });

        res.status(200).json({ msg : "Post deleted successfully!" });
    } catch {
        console.error(err);

        // If no post with the given id
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2025') return res.status(404).json({ error : "Post with given id not found!" });
        }

        return res.status(500).json({ error : "Internal server error!" });
    }
}; 

module.exports = {
    getAllPosts,
    getAllPublishedPosts,
    getAllPostsOfAuthor,
    createPost,
    editPost,
    deletePost
}