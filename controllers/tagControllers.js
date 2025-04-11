const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient, Role, Prisma } = require("../generated/prisma");
const prisma = new PrismaClient();

dotenv.config();

// Controller for getting all tags
const getAllTags = async (req, res) => {
    try {
        const tags = await prisma.tag.findMany();

        res.status(200).json({ tags });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error!" });
    }
};

// Controller to create a tag
const createTag = async (req, res) => {
    // Get submitted data
    const { name, slug } = req.body;
    if (!name)
        return res.status(404).json({ error: "Tag name cannot be empty!" });
    if (!slug)
        return res.status(404).json({ error: "Slug name cannot be empty!" });

    // Try creating tag
    try {
        const tag = await prisma.tag.create({
            data: {
                name,
                slug,
            },
        });

        console.log(tag);
        res.status(201).json({ msg: "Tag created successfully!" });
    } catch (err) {
        console.error(err);
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                return res.status(400).json({
                    error: "Already a tag with this name/slug exists!",
                });
            }
        }
        return res.status(500).json({ error: "Internal server error!" });
    }
};

// Controller to get all posts of a specific tag
const getTagPosts = async (req, res) => {
    const tag = await prisma.tag.findUnique({
        where: {
            slug: req.params.tagName,
        },
    });

    if (!tag) {
        return res.status(404).json({ error: "No such tag found!" });
    }
    try {
        const posts = await prisma.post.findMany({
            where: {
                published: true,
                tags: {
                    has: tag.slug,
                },
            },
        });

        res.status(200).json({ posts });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error!" });
    }
};

module.exports = {
    getAllTags,
    createTag,
    getTagPosts,
};
